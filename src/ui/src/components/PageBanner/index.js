import React from 'react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import {
  BannerContainer,
  BannerWrapper,
  ImageWrapper,
  EmptyBanner
} from './styles'

import { useSite } from '~components/contexts/SiteContext'
import { useEvent } from '~components/contexts/EventContext'
import { useLanguage } from '~components/contexts/LanguageContext'
import { PageBanner as PageBannerController } from '~components/components/PageBanner'

import { checkSiteUrl } from '~ui/utils'
import { Icon } from '~ui-icon'

const PageBannerUI = (props) => {
  const {
    pageBannerState,
    title,
    isCustomerMode,
    handleCustomProductBannerClick,
    business,
    isHorizontal,
    showEmptyState
  } = props

  const [{ site }] = useSite()
  const [events] = useEvent()
  const [, t] = useLanguage()

  const businessUrlTemplate = checkSiteUrl(site?.business_url_template, '/store/:business_slug')
  const productUrlTemplate = checkSiteUrl(site?.product_url_template, '/store/:business_slug?category=:category_id&product=:product_id')

  const onProductRedirect = ({ slug, category, product }) => {
    if (!category && !product) {
      if (isCustomerMode) {
        return events.emit('go_to_page', { page: 'business', params: { store: slug } })
      } else {
        if (businessUrlTemplate === '/store/:business_slug' || businessUrlTemplate === '/:business_slug') {
          return events.emit('go_to_page', { page: 'business', params: { business_slug: slug }, replace: false })
        } else {
          return events.emit('go_to_page', { page: 'business', search: `?${businessUrlTemplate.split('?')[1].replace(':business_slug', '')}${slug}`, replace: false })
        }
      }
    }
    events.emit('product_banner_clicked')
    if (isCustomerMode) {
      return events.emit('go_to_page', {
        page: 'business',
        params: { store: slug },
        search: `?category=${category}&product=${product}`,
        replace: true
      })
    } else {
      if (productUrlTemplate === '/store/:business_slug/:category_slug/:product_slug' || productUrlTemplate === '/:business_slug/:category_slug/:product_slug') {
        return events.emit('go_to_page', {
          page: 'product',
          params: {
            business_slug: slug,
            category_slug: category,
            product_slug: product
          },
          replace: false
        })
      }
      if (productUrlTemplate.includes('/store/:category_slug/:product_slug')) {
        const businessParameter = businessUrlTemplate.replace('/store?', '').replace('=:business_slug', '')
        return events.emit('go_to_page', {
          page: 'product',
          params: {
            category_slug: category,
            product_slug: product
          },
          search: `?${businessParameter}=${slug}`,
          replace: false
        })
      }
      if (productUrlTemplate.includes('/store/:business_slug') && productUrlTemplate.includes('category_id')) {
        const ids = productUrlTemplate.split('?')[1].split('&')
        const categoryParameter = ids[0].replace('=:category_id', '')
        const productParameter = ids[1].replace('=:product_id', '')
        return events.emit('go_to_page', {
          page: 'product',
          params: {
            business_slug: slug
          },
          search: `?${categoryParameter}=${category}&${productParameter}=${product}`,
          replace: false
        })
      }
      if (productUrlTemplate.includes('/:business_slug') && !productUrlTemplate.includes('store')) {
        const ids = productUrlTemplate.split('?')[1].split('&')
        const categoryParameter = ids[0].replace('=:category_id', '')
        const productParameter = ids[1].replace('=:product_id', '')
        return events.emit('go_to_page', {
          page: 'product',
          params: {
            business_slug: slug
          },
          search: `?${categoryParameter}=${category}&${productParameter}=${product}`,
          replace: false
        })
      }
    }
  }

  const handleGoToPage = (action) => {
    if (!action?.url) return
    let slug
    if (action.type === 'business') {
      slug = action.url.split('store/')[1]
      onProductRedirect({ slug })
    }
    if (action.type === 'product') {
      slug = action.url.split('store/')[1]?.split('?')[0]
      const paramString = action.url.split('?')[1]
      const urlParams = new URLSearchParams(paramString)
      const productId = urlParams.get('product')
      const categoryId = urlParams.get('category')
      const foundCategory = business?.categories?.find(category => category.id === Number(categoryId))
      const foundProduct = foundCategory?.products?.find(product => product.id === Number(productId))
      if (business?.slug === slug && foundProduct) {
        handleCustomProductBannerClick(foundProduct)
      } else {
        onProductRedirect({ slug, category: categoryId, product: productId })
      }
    }
  }

  return (
    <>
      {pageBannerState.loading && (
        <BannerContainer isHorizontal={isHorizontal}>
          {Array.from({ length: 3 }).map((_, i) => (
            <BannerWrapper key={i}>
              <Skeleton height={170} />
            </BannerWrapper>
          ))}
        </BannerContainer>
      )}
      {!pageBannerState.loading && pageBannerState.banner?.items?.length > 0 && (
        <>
          {title && <h1>{title}</h1>}
          <BannerContainer isHorizontal={isHorizontal}>
            {isHorizontal
              ? (
                  pageBannerState.banner?.items.map((img, i) => (
                    <BannerWrapper key={i}>
                      <ImageWrapper isHorizontal={isHorizontal} onClick={() => handleGoToPage(img?.action)}>
                        <img src={img.url} className='banner-img' alt='' />
                      </ImageWrapper>
                    </BannerWrapper>
                  ))
                )
              : (
                <Swiper
                  navigation={pageBannerState.banner?.items?.length > 1}
                  spaceBetween={0}
                  modules={[Navigation]}
                  shortSwipes={false}
                  loop={pageBannerState.banner?.items.length > 1}
                  touchStartPreventDefault={false}
                  slidesPerView={1}
                >
                  {pageBannerState.banner?.items.map((img, i) => (
                    <SwiperSlide
                      key={i}
                      onClick={() => handleGoToPage(img?.action)}
                    >
                      <ImageWrapper>
                        <img src={img.url} className='banner-img' alt='' />
                      </ImageWrapper>
                    </SwiperSlide>
                  ))}
                </Swiper>
                )}
          </BannerContainer>
        </>
      )}
      {!pageBannerState.loading && !pageBannerState.banner?.items?.length && showEmptyState && (
        <EmptyBanner>
          <Icon name='image' />
          <span>{t('PAGE_BANNER_EMPTY', 'No promotional banner configured yet.')}</span>
        </EmptyBanner>
      )}
    </>
  )
}

export const PageBanner = (props) => {
  const pageBannerProps = {
    ...props,
    UIComponent: PageBannerUI
  }
  return <PageBannerController {...pageBannerProps} />
}
