"use client";
import React, { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import debounce from "lodash/debounce";
import { PDFPreviewModal } from "@/components/library/pdf-preview-modal";
import { ImagePreviewModal } from "@/components/templates/image-preview-modal";
import { PaymentSuccessModal } from "@/components/payment/success-modal";

type Category = {
  name: string;
  slug: string;
};

type Resource = {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  coverImage?: string;
  slug?: string;
  imageUrl?: string; // For templates
  price?: number;
  categories: Category[];
  type: "blog" | "library" | "template";
};

// 1. Create a small helper component for the image + loader
function ImageWithLoader({
  src,
  alt,
  resourceType,
}: {
  src: string;
  alt: string;
  resourceType: string;
}) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative h-48 overflow-hidden">
      {/* Show spinner while loading */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#e27396]" />
        </div>
      )}

      {/* The actual image, faded in when loaded */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          loading ? "opacity-0" : "opacity-100 group-hover:scale-105"
        }`}
      />

      {/* Resource type label */}
      <div className="absolute top-4 left-4 z-20">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-[#e27396]">
          {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
        </span>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Stores final S3 image URLs after fetching signed URLs
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<any>(null);

  // 2. Fetch signed URL for images
  const fetchImageUrl = async (key: string) => {
    try {
      const response = await fetch(`/api/image/${encodeURIComponent(key)}`);
      const data = await response.json();
      console.log(data);
      if (data.url) {
        setImageUrls((prev) => ({ ...prev, [key]: data.url }));
      }
    } catch (error) {
      console.error("Error fetching image URL:", error);
    }
  };

  const handlePayment = async (resource: Resource) => {
    try {
      setIsProcessingPayment(true);

      // 1. Create order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: resource.type,
          itemId: resource.id,
          email: "user@example.com", // Replace with real user email
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.orderId) throw new Error("Failed to create order");

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Your Company Name",
        description: `Purchase ${resource.title}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // 3. Verify payment
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            setCurrentPurchase(verifyData.purchase);
            setPaymentSuccess(true);
          }
        },
        prefill: {
          email: "user@example.com", // Replace with real user email
        },
        theme: {
          color: "#d45c82",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 3. Fetch resources (blogs, libraryItems, templates) + categories
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();

        const allResources = [
          ...data.content.blogs,
          ...data.content.libraryItems,
          ...data.content.templates,
        ];

        setResources(allResources);
        setFilteredResources(allResources);
        setCategories(data.categories);

        // Fetch image URLs for resources that have a coverImage or imageUrl
        allResources.forEach((resource) => {
          if (resource.type === "template" && resource.imageUrl) {
            fetchImageUrl(resource.imageUrl);
          } else if (resource.coverImage) {
            fetchImageUrl(resource.coverImage);
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // 4. Debounced search + filter function
  const updateFilters = debounce(() => {
    const filtered = resources.filter((resource) => {
      // Match each search term
      const searchMatch = searchQuery
        .toLowerCase()
        .split(" ")
        .every(
          (term) =>
            resource.title.toLowerCase().includes(term) ||
            resource.description?.toLowerCase().includes(term) ||
            resource.excerpt?.toLowerCase().includes(term)
        );

      const typeMatch = selectedType === "all" || resource.type === selectedType;
      const categoryMatch =
        selectedCategory === "all" ||
        resource.categories.some((cat) => cat.slug === selectedCategory);

      return searchMatch && typeMatch && categoryMatch;
    });

    setFilteredResources(filtered);
  }, 300);

  // 5. Run filter whenever resources, search, or selections change
  useEffect(() => {
    updateFilters();
  }, [resources, searchQuery, selectedType, selectedCategory]);

  const resourceTypes = [
    { id: "all", label: "All Resources" },
    { id: "blog", label: "Articles & Guides" },
    { id: "library", label: "E-Books & PDFs" },
    { id: "template", label: "Templates" },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 pt-28">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Relationship Resources
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our collection of articles, guides, and tools to help you build better relationships
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by title, description, or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-100 focus:border-[#e27396] 
                     focus:ring-1 focus:ring-[#e27396] outline-none shadow-sm"
        />
      </div>

      {/* Resource Type Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {resourceTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`group relative px-6 py-3 rounded-full transition-all
                ${
                  selectedType === type.id
                    ? "bg-[#d45c82] text-white"
                    : "text-gray-600 hover:bg-[#e27396]/10"
                }`}
            >
              <span className="relative z-10 font-medium">{type.label}</span>
              {selectedType === type.id && (
                <motion.div
                  layoutId="activeType"
                  className="absolute inset-0 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm transition-all
              ${
                selectedCategory === "all"
                  ? "bg-[#e27396]/10 text-[#e27396]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all
                ${
                  selectedCategory === category.slug
                    ? "bg-[#e27396]/10 text-[#e27396]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#e27396]" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => {
            const coverOrImageKey =
              resource.type === "template"
                ? resource.imageUrl
                : resource.coverImage;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 
                           hover:shadow-lg transition-all duration-300"
              >
                {/* Only show image section if we have a valid key */}
                {coverOrImageKey && (
                  <ImageWithLoader
                    src={imageUrls[coverOrImageKey]}
                    alt={resource.title}
                    resourceType={resource.type}
                  />
                )}

                <div className="p-6">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {resource.categories.map((category) => (
                      <span
                        key={category.slug}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#e27396] 
                             transition-colors line-clamp-2"
                  >
                    {resource.title}
                  </h3>

                  {/* Description / Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {resource.description || resource.excerpt}
                  </p>

                  {/* Bottom Section: Price + Buttons */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    {resource.price !== undefined && (
                      <span className="text-[#e27396] font-medium">
                        {resource.price === 0 ? "Free" : `₹${resource.price}`}
                      </span>
                    )}

                    <div className="flex gap-2">
                      {(resource.type === "template" ||
                        resource.type === "library") && (
                        <>
                          <button
                            onClick={() => {
                              setPreviewOpen(true);
                              setPreviewResource(resource);
                            }}
                            className="px-4 py-2 rounded-lg bg-[#e27396]/10 text-[#e27396] font-medium hover:bg-[#e27396]/20 transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handlePayment(resource)}
                            disabled={isProcessingPayment}
                            className="px-4 py-2 rounded-lg bg-[#e27396]/10 text-[#e27396] font-medium hover:bg-[#e27396]/20 transition-colors"
                          >
                            {isProcessingPayment ? "Processing..." : "Buy Now"}
                          </button>
                        </>
                      )}
                      {resource.type === "blog" && (
                        <Link
                          href={`/blog/${resource.slug}`}
                          className="px-4 py-2 rounded-lg bg-[#e27396]/10 text-[#e27396] font-medium hover:bg-[#e27396]/20 transition-colors"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Preview Modals */}
          {previewResource && previewResource.type === "library" && (
            <PDFPreviewModal
              isOpen={previewOpen}
              onClose={() => {
                setPreviewOpen(false);
                setPreviewResource(null);
              }}
              pdfUrl={`/api/library/${previewResource.id}/pdf`}
              title={previewResource.title}
              previewPages={3}
            />
          )}

          {previewResource &&
            previewResource.type === "template" &&
            previewResource.imageUrl && (
              <ImagePreviewModal
                isOpen={previewOpen}
                onClose={() => {
                  setPreviewOpen(false);
                  setPreviewResource(null);
                }}
                imageUrl={imageUrls[previewResource.imageUrl]}
                title={previewResource.title}
              />
            )}

          {/* Payment Success Modal */}
          {currentPurchase && (
            <PaymentSuccessModal
              isOpen={paymentSuccess}
              onClose={() => {
                setPaymentSuccess(false);
                setCurrentPurchase(null);
              }}
              itemId={currentPurchase.itemId}
              itemType={currentPurchase.type}
              itemTitle={currentPurchase.title}
            />
          )}

          {/* No Results */}
          {!isLoading && filteredResources.length === 0 && (
            <div className="text-center py-12 col-span-3">
              <p className="text-gray-600 text-lg">
                No resources found matching your criteria. Try adjusting your search
                or filters.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
