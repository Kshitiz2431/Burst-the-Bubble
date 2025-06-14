// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import { Search, Loader2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";
// import debounce from "lodash/debounce";
// import { PDFPreviewModal } from "@/components/library/pdf-preview-modal";
// import { PaymentSuccessModal } from "@/components/payment/success-modal";
// import { toast } from "sonner";

// type Category = {
//   name: string;
//   slug: string;
// };

// type Resource = {
//   id: string;
//   title: string;
//   description?: string;
//   excerpt?: string;
//   coverImage?: string;
//   slug?: string;
//   imageUrl?: string; // For templates
//   price?: number;
//   categories: Category[];
//   type: "blog" | "library" | "template";
// };

// type Purchase = {
//   itemId: string;
//   itemType: 'library' | 'template';
//   itemTitle: string;
//   // Add other purchase properties as needed
// };

// // Enhanced image loader component with animations
// function ImageWithLoader({
//   src,
//   alt,
//   resourceType,
// }: {
//   src: string;
//   alt: string;
//   resourceType: string;
// }) {
//   const [loading, setLoading] = useState(true);

//   return (
//     <div className="relative h-48 overflow-hidden rounded-t-xl">
//       {/* Show spinner while loading */}
//       {loading && (
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100"
//         >
//           <Loader2 className="w-8 h-8 animate-spin text-[#e27396]" />
//         </motion.div>
//       )}

//       {/* The actual image, faded in when loaded */}
//       <img
//         src={src}
//         alt={alt}
//         onLoad={() => setLoading(false)}
//         className={`w-full h-full object-cover transition-transform duration-300 ${
//           loading ? "opacity-0" : "opacity-100 group-hover:scale-105"
//         }`}
//       />

//       {/* Resource type label */}
//       <motion.div 
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="absolute top-4 left-4 z-20"
//       >
//         <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-[#e27396] shadow-sm">
//           {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
//         </span>
//       </motion.div>
//     </div>
//   );
// }

// export default function ResourcesPage() {
//   const [resources, setResources] = useState<Resource[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
//   const [selectedType, setSelectedType] = useState<string>("all");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [isLoading, setIsLoading] = useState(true);

//   // Stores final S3 image URLs after fetching signed URLs
//   const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

//   const [previewOpen, setPreviewOpen] = useState(false);
//   const [previewResource, setPreviewResource] = useState<Resource | null>(null);
//   const [isProcessingPayment, setIsProcessingPayment] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);

//   // Fetch signed URL for images
//   const fetchImageUrl = async (key: string) => {
//     try {
//       const response = await fetch(`/api/image/${encodeURIComponent(key)}`);
//       const data = await response.json();
//       console.log(data);
//       if (data.url) {
//         setImageUrls((prev) => ({ ...prev, [key]: data.url }));
//       }
//     } catch (error) {
//       console.error("Error fetching image URL:", error);
//     }
//   };

//   const handlePayment = async (resource: Resource) => {
//     try {
//       setIsProcessingPayment(true);

//       // 1. Create order
//       const orderResponse = await fetch("/api/payment/create-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           itemType: resource.type,
//           itemId: resource.id,
//           email: "user@example.com", // Replace with real user email
//         }),
//       });

//       const orderData = await orderResponse.json();
//       if (!orderData.orderId) throw new Error("Failed to create order");

//       console.log("Order created:", orderData);

//       // 2. Initialize Razorpay
//       const options = {
//         key: orderData.keyId,
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: "Burst The Bubble",
//         description: `Purchase ${resource.title}`,
//         order_id: orderData.orderId,
//         handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
//           try {
//             console.log('Payment successful:', response);
            
//             // 3. Verify payment
//             const verifyResponse = await fetch("/api/payment/verify", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify(response),
//             });

//             const verifyData = await verifyResponse.json();
            
//             if (!verifyResponse.ok) {
//               console.error('Payment verification failed:', verifyData);
//               throw new Error(verifyData.error || 'Payment verification failed');
//             }

//             console.log('Payment verified successfully:', verifyData);
            
//             setCurrentPurchase(verifyData.purchase);
//             setPaymentSuccess(true);
//           } catch (error) {
//             console.error('Payment verification error:', error);
//             toast.error(error instanceof Error ? error.message : "Payment verification failed");
//           }
//         },
//         prefill: {
//           email: "user@example.com", // Replace with real user email
//         },
//         modal: {
//           ondismiss: function() {
//             setIsProcessingPayment(false);
//             console.log('Payment modal closed by user');
//           },
//         },
//         theme: {
//           color: "#e27396",
//         }
//       };

//       // Log the options for debugging
//       console.log("Razorpay options:", {
//         ...options,
//         key: options.key ? "Present" : "Missing", // Don't log the actual key
//       });

//       // Check if key is present
//       if (!options.key) {
//         console.error("Razorpay key is missing!");
//         toast.error("Payment configuration error. Please try again later.");
//         setIsProcessingPayment(false);
//         return;
//       }

//       try {
//         const razorpay = new ((window as { Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (response: { error: { description: string } }) => void) => void } }).Razorpay)(options);
//         razorpay.on('payment.failed', function(response: { error: { description: string } }) {
//           console.error("Payment failed:", response.error);
//           toast.error(`Payment failed: ${response.error?.description || 'Unknown error'}`);
//           setIsProcessingPayment(false);
//         });
//         razorpay.open();
//       } catch (error) {
//         console.error("Razorpay initialization error:", error);
//         toast.error("Payment system initialization failed. Please try again later.");
//         setIsProcessingPayment(false);
//       }
//     } catch (error) {
//       console.error("Payment error:", error);
//       toast.error("Failed to process payment. Please try again later.");
//       setIsProcessingPayment(false);
//     }
//   };

//   // Fetch resources (blogs, libraryItems, templates) + categories
//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         const response = await fetch("/api/resources");
//         const data = await response.json();

//         const allResources = [
//           ...data.content.blogs,
//           ...data.content.libraryItems,
//           ...data.content.templates,
//         ];

//         setResources(allResources);
//         setFilteredResources(allResources);
//         setCategories(data.categories);

//         // Fetch image URLs for resources that have a coverImage or imageUrl
//         allResources.forEach((resource) => {
//           if (resource.type === "template" && resource.imageUrl) {
//             fetchImageUrl(resource.imageUrl);
//           } else if (resource.coverImage) {
//             fetchImageUrl(resource.coverImage);
//           }
//         });

//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error fetching resources:", error);
//         setIsLoading(false);
//       }
//     };

//     fetchResources();
//   }, []);

//   // Debounced search + filter function
//   const updateFilters = useCallback(() => {
//     const filtered = resources.filter((resource) => {
//       // Match each search term
//       const searchMatch = searchQuery
//         .toLowerCase()
//         .split(" ")
//         .every(
//           (term) =>
//             resource.title.toLowerCase().includes(term) ||
//             resource.description?.toLowerCase().includes(term) ||
//             resource.excerpt?.toLowerCase().includes(term)
//         );

//       const typeMatch = selectedType === "all" || resource.type === selectedType;
//       const categoryMatch =
//         selectedCategory === "all" ||
//         resource.categories.some((cat) => cat.slug === selectedCategory);

//       return searchMatch && typeMatch && categoryMatch;
//     });

//     setFilteredResources(filtered);
//   }, [resources, searchQuery, selectedType, selectedCategory]);

//   // Run filter whenever resources, search, or selections change
//   useEffect(() => {
//     const debouncedUpdate = debounce(updateFilters, 300);
//     debouncedUpdate();
//     return () => debouncedUpdate.cancel();
//   }, [updateFilters]);

//   const resourceTypes = [
//     { id: "all", label: "All Resources" },
//     { id: "blog", label: "Blogs" },
//     { id: "library", label: "Love Library" },
//     { id: "template", label: "Love helpers" },
//   ];

//   // Get card background colors based on resource type
//   const getCardBackground = (type: string) => {
//     switch (type) {
//       case 'blog': return 'bg-gradient-to-br from-white to-pink-50';
//       case 'library': return 'bg-gradient-to-br from-white to-purple-50';
//       case 'template': return 'bg-gradient-to-br from-white to-rose-50';
//       default: return 'bg-white';
//     }
//   };

//   return (
//     <div className="relative overflow-hidden">
//       {/* Background decorative elements */}
//       <div className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-50/80 to-white">
//         {/* Pattern overlay */}
//         <div 
//           className="absolute inset-0 opacity-[0.03]" 
//           style={{ 
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e27396' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
//           }}
//         />
        
//         {/* Decorative circles */}
//         <div className="absolute top-20 left-[5%] w-64 h-64 rounded-full bg-pink-200/10 blur-3xl animate-pulse-slow" />
//         <div className="absolute bottom-40 right-[10%] w-96 h-96 rounded-full bg-purple-200/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
//         <div className="absolute top-[40%] right-[15%] w-48 h-48 rounded-full bg-[#e27396]/5 blur-2xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
//         <div className="absolute top-[60%] left-[10%] w-72 h-72 rounded-full bg-rose-100/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
//       </div>
      
//       <main className="relative max-w-7xl mx-auto px-4 py-12 pt-28 z-10">
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-12 text-center"
//         >
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Relationship Resources
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Discover our collection of articles, guides, and tools to help you build better relationships
//           </p>
//         </motion.div>

//         {/* Search Bar - Visual Enhancement */}
//         <div className="relative max-w-2xl mx-auto mb-12">
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="relative z-10"
//           >
//             <div className="absolute -inset-3 bg-white/50 rounded-2xl blur-xl -z-10" />
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search by title, description, or content..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#e27396] 
//                         focus:ring-2 focus:ring-[#e27396] focus:ring-opacity-30 outline-none shadow-sm
//                         transition-all duration-300 bg-white/70 backdrop-blur-sm"
//             />
//           </motion.div>
//         </div>

//         {/* Resource Type Tabs - Visual Enhancement */}
//         <div className="mb-8">
//           <motion.div 
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="flex flex-wrap justify-center gap-4 mb-6"
//           >
//             {resourceTypes.map((type, index) => (
//               <motion.button
//                 key={type.id}
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 + index * 0.1 }}
//                 onClick={() => setSelectedType(type.id)}
//                 className={`group relative px-6 py-3 rounded-full transition-all duration-300
//                   ${
//                     selectedType === type.id
//                       ? "bg-[#e27396] text-white shadow-md"
//                       : "bg-white text-gray-600 hover:bg-[#e27396]/10 shadow-sm"
//                   }`}
//               >
//                 <span className="relative z-10 font-medium">{type.label}</span>
//                 {selectedType === type.id && (
//                   <motion.div
//                     layoutId="activeType"
//                     className="absolute inset-0 rounded-full"
//                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
//                   />
//                 )}
//               </motion.button>
//             ))}
//           </motion.div>

//           {/* Category Pills - Visual Enhancement */}
//           <motion.div 
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="flex flex-wrap justify-center gap-2"
//           >
//             <button
//               onClick={() => setSelectedCategory("all")}
//               className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300
//                 ${
//                   selectedCategory === "all"
//                     ? "bg-[#e27396]/10 text-[#e27396] font-medium shadow-sm"
//                     : "bg-white text-gray-600 hover:bg-[#e27396]/5 shadow-sm"
//                 }`}
//             >
//               All Categories
//             </button>
//             {categories.map((category, index) => (
//               <motion.button
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.3 + index * 0.03 }}
//                 key={category.slug}
//                 onClick={() => setSelectedCategory(category.slug)}
//                 className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300
//                   ${
//                     selectedCategory === category.slug
//                       ? "bg-[#e27396]/10 text-[#e27396] font-medium shadow-sm"
//                       : "bg-white text-gray-600 hover:bg-[#e27396]/5 shadow-sm"
//                   }`}
//               >
//                 {category.name}
//               </motion.button>
//             ))}
//           </motion.div>
//         </div>

//         {/* Resources Grid */}
//         {isLoading ? (
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="flex items-center justify-center py-12"
//           >
//             <div className="relative">
//               <div className="absolute -inset-4 rounded-full bg-[#e27396]/10 animate-ping"></div>
//               <Loader2 className="w-10 h-10 animate-spin text-[#e27396] relative z-10" />
//             </div>
//           </motion.div>
//         ) : (
//           <motion.div 
//             layout
//             className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
//           >
//             <AnimatePresence>
//               {filteredResources.map((resource, index) => {
//                 const coverOrImageKey =
//                   resource.type === "template"
//                     ? resource.imageUrl
//                     : resource.coverImage;

//                 return (
//                   <motion.div
//                     key={resource.id}
//                     layout
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.95 }}
//                     transition={{ delay: index * 0.05, duration: 0.3 }}
//                     className={`
//                       group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300
//                       ${getCardBackground(resource.type)}
//                     `}
//                   >
//                     {/* Resource Image */}
//                     {coverOrImageKey && (
//                       <ImageWithLoader
//                         src={imageUrls[coverOrImageKey] || coverOrImageKey}
//                         alt={resource.title}
//                         resourceType={resource.type}
//                       />
//                     )}

//                     {/* Resource Content */}
//                     <div className="p-6">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#e27396] transition-colors">
//                         {resource.title}
//                       </h3>
//                       <p className="text-sm text-gray-600 mb-4 line-clamp-2">
//                         {resource.description || resource.excerpt}
//                       </p>

//                       {/* Categories */}
//                       <div className="flex flex-wrap gap-2 mb-4">
//                         {resource.categories.map((category) => (
//                           <span
//                             key={category.slug}
//                             className="px-2 py-1 text-xs rounded-full bg-[#e27396]/10 text-[#e27396]"
//                           >
//                             {category.name}
//                           </span>
//                         ))}
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex justify-between items-center mt-4">
//                         {resource.type === "blog" ? (
//                           <Link
//                             href={`/blog/${resource.slug}`}
//                             className="inline-flex items-center text-sm font-medium text-[#e27396] hover:text-[#d45c82] transition-colors"
//                           >
//                             Read More
//                             <svg
//                               className="ml-1 w-4 h-4"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M9 5l7 7-7 7"
//                               />
//                             </svg>
//                           </Link>
//                         ) : (
//                           <button
//                             onClick={() => {
//                               setPreviewResource(resource);
//                               setPreviewOpen(true);
//                             }}
//                             className="inline-flex items-center text-sm font-medium text-[#e27396] hover:text-[#d45c82] transition-colors"
//                           >
//                             Preview
//                             <svg
//                               className="ml-1 w-4 h-4"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                               />
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                               />
//                             </svg>
//                           </button>
//                         )}

//                         {resource.type !== "blog" && (
//                           <button
//                             onClick={() => handlePayment(resource)}
//                             disabled={isProcessingPayment}
//                             className="inline-flex items-center px-4 py-2 rounded-lg bg-[#e27396] text-white text-sm font-medium hover:bg-[#d45c82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                           >
//                             {isProcessingPayment ? (
//                               <>
//                                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                 Processing...
//                               </>
//                             ) : (
//                               <>
//                                 Buy Now
//                                 {resource.price && (
//                                   <span className="ml-1">₹{resource.price}</span>
//                                 )}
//                               </>
//                             )}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>
//           </motion.div>
//         )}

//         {/* Preview Modal */}
//         <PDFPreviewModal
//           isOpen={previewOpen}
//           onClose={() => setPreviewOpen(false)}
//           pdfUrl={previewResource?.coverImage || ''}
//           title={previewResource?.title || ''}
//           previewPages={3}
//         />

//         {/* Payment Success Modal */}
//         <PaymentSuccessModal
//           isOpen={paymentSuccess}
//           onClose={() => setPaymentSuccess(false)}
//           itemId={currentPurchase?.itemId || ''}
//           itemType={currentPurchase?.itemType || 'library'}
//           itemTitle={currentPurchase?.itemTitle || ''}
//         />
//       </main>
//     </div>
//   );
// }





"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import debounce from "lodash/debounce";
import { PDFPreviewModal } from "@/components/library/pdf-preview-modal";
import { PaymentSuccessModal } from "@/components/payment/success-modal";
import { toast } from "sonner";

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

type Purchase = {
  itemId: string;
  itemType: 'library' | 'template';
  itemTitle: string;
};

// Define a specific type for the Razorpay options
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    // FIX #1: Add the required 'name' property to the prefill type
    name: string;
    email: string;
  };
  modal: {
    ondismiss: () => void;
    events: {
      'payment.failed': (response: { error: { description: string } }) => void;
    };
  };
  theme: {
    color: string;
  };
};

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
    <div className="relative h-48 overflow-hidden rounded-t-xl">
      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100"
        >
          <Loader2 className="w-8 h-8 animate-spin text-[#e27396]" />
        </motion.div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoading(false)}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          loading ? "opacity-0" : "opacity-100 group-hover:scale-105"
        }`}
      />
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-4 left-4 z-20"
      >
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-[#e27396] shadow-sm">
          {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
        </span>
      </motion.div>
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
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);

  const fetchImageUrl = async (key: string) => {
    try {
      const response = await fetch(`/api/image/${encodeURIComponent(key)}`);
      const data = await response.json();
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

      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: resource.type,
          itemId: resource.id,
          email: "user@example.com", 
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.orderId) throw new Error("Failed to create order");
      
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Burst The Bubble",
        description: `Purchase ${resource.title}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
            setCurrentPurchase(verifyData.purchase);
            setPaymentSuccess(true);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed");
          }
        },
        prefill: {
          // FIX #2: Add the 'name' property to the prefill object
          name: "Test User", // Replace with actual user name if available
          email: "user@example.com",
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
          },
          events: {
            'payment.failed': function(response) {
              toast.error(`Payment failed: ${response.error?.description || 'Unknown error'}`);
              setIsProcessingPayment(false);
            }
          }
        },
        theme: {
          color: "#e27396",
        }
      };

      if (!options.key) {
        toast.error("Payment configuration error. Please try again later.");
        setIsProcessingPayment(false);
        return;
      }

      try {
        const razorpay = new ((window as { 
          Razorpay: new (options: RazorpayOptions) => { open: () => void } 
        }).Razorpay)(options);
        razorpay.open();
      } catch (error) {
        console.log(error);
        toast.error("Payment system initialization failed. Please try again later.");
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to process payment. Please try again later.");
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
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
        allResources.forEach((resource) => {
          const key = resource.type === "template" ? resource.imageUrl : resource.coverImage;
          if (key) {
            fetchImageUrl(key);
          }
        });
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const updateFilters = useCallback(() => {
    const filtered = resources.filter((resource) => {
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
  }, [resources, searchQuery, selectedType, selectedCategory]);

  useEffect(() => {
    const debouncedUpdate = debounce(updateFilters, 300);
    debouncedUpdate();
    return () => debouncedUpdate.cancel();
  }, [updateFilters]);

  const resourceTypes = [
    { id: "all", label: "All Resources" },
    { id: "blog", label: "Blogs" },
    { id: "library", label: "Love Library" },
    { id: "template", label: "Love helpers" },
  ];

  const getCardBackground = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-gradient-to-br from-white to-pink-50';
      case 'library': return 'bg-gradient-to-br from-white to-purple-50';
      case 'template': return 'bg-gradient-to-br from-white to-rose-50';
      default: return 'bg-white';
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-50/80 to-white">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e27396' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }}
        />
        <div className="absolute top-20 left-[5%] w-64 h-64 rounded-full bg-pink-200/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-40 right-[10%] w-96 h-96 rounded-full bg-purple-200/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[15%] w-48 h-48 rounded-full bg-[#e27396]/5 blur-2xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[60%] left-[10%] w-72 h-72 rounded-full bg-rose-100/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      <main className="relative max-w-7xl mx-auto px-4 py-12 pt-28 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Relationship Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our collection of articles, guides, and tools to help you build better relationships
          </p>
        </motion.div>

        <div className="relative max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10"
          >
            <div className="absolute -inset-3 bg-white/50 rounded-2xl blur-xl -z-10" />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, description, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#e27396] 
                        focus:ring-2 focus:ring-[#e27396] focus:ring-opacity-30 outline-none shadow-sm
                        transition-all duration-300 bg-white/70 backdrop-blur-sm"
            />
          </motion.div>
        </div>

        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-6"
          >
            {resourceTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => setSelectedType(type.id)}
                className={`group relative px-6 py-3 rounded-full transition-all duration-300 ${
                  selectedType === type.id
                    ? "bg-[#e27396] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-[#e27396]/10 shadow-sm"
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
              </motion.button>
            ))}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2"
          >
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-[#e27396]/10 text-[#e27396] font-medium shadow-sm"
                  : "bg-white text-gray-600 hover:bg-[#e27396]/5 shadow-sm"
              }`}
            >
              All Categories
            </button>
            {categories.map((category, index) => (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                key={category.slug}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                  selectedCategory === category.slug
                    ? "bg-[#e27396]/10 text-[#e27396] font-medium shadow-sm"
                    : "bg-white text-gray-600 hover:bg-[#e27396]/5 shadow-sm"
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#e27396]/10 animate-ping"></div>
              <Loader2 className="w-10 h-10 animate-spin text-[#e27396] relative z-10" />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredResources.map((resource, index) => {
                const coverOrImageKey = resource.type === "template" ? resource.imageUrl : resource.coverImage;
                return (
                  <motion.div
                    key={resource.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${getCardBackground(resource.type)}`}
                  >
                    {coverOrImageKey && (
                      <ImageWithLoader
                        src={imageUrls[coverOrImageKey] || coverOrImageKey}
                        alt={resource.title}
                        resourceType={resource.type}
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#e27396] transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {resource.description || resource.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.categories.map((category) => (
                          <span key={category.slug} className="px-2 py-1 text-xs rounded-full bg-[#e27396]/10 text-[#e27396]">
                            {category.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        {resource.type === "blog" ? (
                          <Link href={`/blog/${resource.slug}`} className="inline-flex items-center text-sm font-medium text-[#e27396] hover:text-[#d45c82] transition-colors">
                            Read More
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                          </Link>
                        ) : (
                          <button
                            onClick={() => { setPreviewResource(resource); setPreviewOpen(true); }}
                            className="inline-flex items-center text-sm font-medium text-[#e27396] hover:text-[#d45c82] transition-colors"
                          >
                            Preview
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </button>
                        )}
                        {resource.type !== "blog" && (
                          <button
                            onClick={() => handlePayment(resource)}
                            disabled={isProcessingPayment}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#e27396] text-white text-sm font-medium hover:bg-[#d45c82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessingPayment ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                            ) : (
                              <>Buy Now{resource.price && <span className="ml-1">₹{resource.price}</span>}</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
        <PDFPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          pdfUrl={previewResource?.coverImage || ''}
          title={previewResource?.title || ''}
          previewPages={3}
        />
        <PaymentSuccessModal
          isOpen={paymentSuccess}
          onClose={() => setPaymentSuccess(false)}
          itemId={currentPurchase?.itemId || ''}
          itemType={currentPurchase?.itemType || 'library'}
          itemTitle={currentPurchase?.itemTitle || ''}
        />
      </main>
    </div>
  );
}