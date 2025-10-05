import { writeClient } from "@/sanity/lib/serverClient";
import { ACTIVE_PROMOTIONAL_BANNERS_QUERY } from "@/sanity/queries/promotionalBanner";

export async function getActivePromotionalBanners(targetAudience = "all") {
  try {
    let banners = await writeClient.fetch(ACTIVE_PROMOTIONAL_BANNERS_QUERY);
    
    // Filter by target audience if specified
    if (targetAudience !== "all") {
      // Handle multiple audiences (comma-separated)
      const audiences = targetAudience.split(',').map(a => a.trim());
      banners = banners.filter(banner => 
        banner.targetAudience === "all" || audiences.includes(banner.targetAudience)
      );
    }
    
    // Auto-deactivate banners whose endDate has passed
    const nowIso = new Date().toISOString();
    const expired = banners.filter(
      (banner) => banner.endDate && banner.endDate < nowIso
    );
    
    if (expired.length > 0) {
      try {
        const tx = writeClient.transaction();
        expired.forEach((banner) => {
          tx.patch(banner._id, (p) =>
            p.set({ isActive: false })
          );
        });
        await tx.commit();
        
        // Remove expired banners from the result
        banners = banners.filter(banner => 
          !expired.find(exp => exp._id === banner._id)
        );
      } catch (error) {
        console.error("Error deactivating expired banners:", error);
        // Continue with original banners if update fails
      }
    }
    
    return banners;
  } catch (error) {
    console.error("Error fetching promotional banners:", error);
    return [];
  }
}