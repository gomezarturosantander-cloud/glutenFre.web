import styled, { css } from 'styled-components'

export const BannerContainer = styled.div`
  width: 100%;
  margin: 20px 0 20px;
  overflow: hidden;

  ${({ isHorizontal }) => isHorizontal && css`
    width: calc(100vw - 60px);
    display: flex;
    gap: 20px;
    padding: 4px 20px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `}

  .swiper-button-next {
    background-image: url(${props => props.theme.images.general.rightArrow});
    background-color: #d1d0d04d;
    background-repeat: no-repeat;
    background-position: 55% center;
    width: 32px;
    height: 32px;
    box-shadow: rgb(0 0 0 / 7%) 0px 4px 10px;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .swiper-button-prev {
    background-image: url(${props => props.theme.images.general.leftArrow});
    background-color: #d1d0d04d;
    background-repeat: no-repeat;
    background-position: 45% center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    box-shadow: rgb(0 0 0 / 7%) 0px 4px 10px;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .swiper-button-next::after, .swiper-button-prev::after {
    display: none;
  }
`

export const BannerWrapper = styled.div`
  width: 356px;
  height: 169px;
  flex-shrink: 0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`

export const ImageWrapper = styled.div`
  cursor: pointer;
  width: 100%;
  padding-top: 18%;
  position: relative;

  ${({ isHorizontal }) => isHorizontal && css`
    width: 100%;
    height: 100%;
    padding-top: 0;
  `}

  .banner-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${props => props.theme?.utils?.radius?.m}px;
  }
`

export const EmptyBanner = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin: 20px 0;
  padding: 40px 20px;
  border-radius: ${props => props.theme?.utils?.radius?.m}px;
  background-color: ${props => props.theme.colors.lightGreen};
  color: ${props => props.theme.colors.darkGreen};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  font-size: 14px;

  svg {
    font-size: 28px;
  }
`
