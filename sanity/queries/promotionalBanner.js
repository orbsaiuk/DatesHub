export const ACTIVE_PROMOTIONAL_BANNERS_QUERY = `
*[_type == "promotionalBanner" && isActive == true && (
  !defined(startDate) || startDate <= now()
) && (
  !defined(endDate) || endDate >= now()
)] | order(displayOrder asc, _createdAt desc) [0...5] {
  _id,
  title,
  subtitle,
  description,
  image{
    asset->{
      _id,
      url,
      metadata {
        dimensions,
        lqip,
        blurhash
      }
    }
  },
  ctaText,
  ctaLink,
  targetAudience,
  displayOrder,
  startDate,
  endDate,
  showEndDate
}`;

export const ALL_PROMOTIONAL_BANNERS_QUERY = `
*[_type == "promotionalBanner"] | order(displayOrder asc, _createdAt desc) {
  _id,
  title,
  subtitle,
  description,
  image{
    asset->{
      _id,
      url,
      metadata {
        dimensions,
        lqip,
        blurhash
      }
    }
  },
  ctaText,
  ctaLink,
  isActive,
  targetAudience,
  displayOrder,
  startDate,
  endDate,
  showEndDate,
  _createdAt,
  _updatedAt
}`;

export const PROMOTIONAL_BANNER_BY_ID_QUERY = `
*[_type == "promotionalBanner" && _id == $id][0] {
  _id,
  title,
  subtitle,
  description,
  image{
    asset->{
      _id,
      url,
      metadata {
        dimensions,
        lqip,
        blurhash
      }
    }
  },
  ctaText,
  ctaLink,
  isActive,
  targetAudience,
  displayOrder,
  startDate,
  endDate,
  showEndDate,
  _createdAt,
  _updatedAt
}`;
