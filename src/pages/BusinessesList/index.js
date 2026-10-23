import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from 'styled-components'

import { HelmetTags } from '../../components/HelmetTags'
import settings from '../../config'
import { parseSearchQueryLocation } from '../../utils/searchQueryLocation'

import { useSite } from '~components/contexts/SiteContext'
import { useEvent } from '~components/contexts/EventContext'
import { BusinessesListing } from '~ui/src/components/BusinessesListing'
import { checkSiteUrl } from '~ui/utils'

export const BusinessesList = (props) => {
  const { search } = useLocation()
  const [events] = useEvent()
  const [{ site }] = useSite()
  const theme = useTheme()
  const customLocation = useMemo(() => parseSearchQueryLocation(search), [search])
  const businessUrlTemplate = checkSiteUrl(site?.business_url_template, '/store/:business_slug')

  // Deep link desde el Home (HomeCategories): /search?business_type=<id>
  // preselecciona un único business_type real via el mecanismo
  // initialFilterKey/initialFilterValue que ya soporta el controller BusinessList.
  const businessTypeParam = useMemo(() => {
    const value = new URLSearchParams(search).get('business_type')
    const parsed = value !== null ? Number(value) : null
    return Number.isFinite(parsed) ? parsed : null
  }, [search])

  const websiteThemeType = theme?.my_products?.components?.website_theme?.components?.type
  const websiteThemeBusinessSlug = theme?.my_products?.components?.website_theme?.components?.business_slug
  const updatedBusinessSlug = (websiteThemeType === 'single_store' && websiteThemeBusinessSlug) || settings?.businessSlug
  const websiteThemeFranchiseSlug = theme?.my_products?.components?.website_theme?.components?.franchise_slug || websiteThemeBusinessSlug
  const updatedFranchiseSlug = (websiteThemeType === 'franchise' && websiteThemeFranchiseSlug) || settings?.franchiseSlug

  const businessListingProps = {
    ...props,
    customLocation,
    isSearchByName: true,
    isSearchByDescription: true,
    franchiseId: updatedFranchiseSlug,
    businessId: updatedBusinessSlug,
    avoidRefreshUserInfo: true,
    businessUrlTemplate,
    onBusinessClick: (business) => {
      if (businessUrlTemplate === '/store/:business_slug' || businessUrlTemplate === '/:business_slug') {
        events.emit('go_to_page', { page: 'business', params: { business_slug: business.slug } })
      } else {
        events.emit('go_to_page', { page: 'business', search: `?${businessUrlTemplate.split('?')[1].replace(':business_slug', '')}${business.slug}` })
      }
    },
    currentPageParam: 0,
    propsToFetch: ['id', 'name', 'description', 'header', 'logo', 'types', 'location', 'address', 'ribbon', 'timezone', 'schedule', 'open', 'delivery_price', 'distance', 'delivery_time', 'pickup_time', 'reviews', 'featured', 'offers', 'food', 'laundry', 'alcohol', 'groceries', 'slug', 'city', 'city_id', 'configs', 'today', 'enabled', 'disabled_reason', 'available_drivers_count', 'activated_orders'],
    onRedirectPage: (data) => events.emit('go_to_page', data),
    ...(businessTypeParam !== null && {
      initialFilterKey: 'category',
      initialFilterValue: businessTypeParam
    })
  }

  return (
    <>
      <HelmetTags page='search' />
      <BusinessesListing {...businessListingProps} />
    </>
  )
}

export default BusinessesList
