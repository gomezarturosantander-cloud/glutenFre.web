import styled, { css } from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  background-color: ${props => props.theme.colors.backgroundPage};
`

export const SectionsTabs = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  background-color: ${props => props.theme.colors.darkGreen};
  padding: 16px 8px 0;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 769px) {
    max-width: 1024px;
    margin: 0 auto;
  }
`

export const SectionTab = styled.button`
  flex: 1;
  min-width: 90px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px 10px;
  font-size: 15px;
  font-family: inherit;
  color: ${props => props.theme.colors.darkTextColor};
  white-space: nowrap;
  transition: all 0.2s ease;

  ${({ active }) => active && css`
    background-color: ${props => props.theme.colors.backgroundPage};
    font-weight: 600;
    padding-top: 14px;
    padding-bottom: 14px;
    border-radius: ${props => props.theme?.utils?.radius?.m}px ${props => props.theme?.utils?.radius?.m}px 0 0;
  `}
`

export const SubsectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px 16px 8px;

  @media (min-width: 769px) {
    max-width: 1024px;
    margin: 0 auto;
    gap: 20px;
  }
`

export const SubsectionTile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-family: inherit;

  &:hover .tile-image {
    transform: translateY(-2px);
  }
`

export const SubsectionImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: ${props => props.theme?.utils?.radius?.m}px;
  background-color: ${props => props.theme.colors.secundary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.2s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 44%;
    height: 44%;
    color: ${props => props.theme.colors.darkTextColor};
  }
`

export const SubsectionLabel = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.darkTextColor};
  text-align: center;
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 30px 20px;
  color: ${props => props.theme.colors.darkGray};

  svg {
    font-size: 28px;
    color: ${props => props.theme.colors.lightGray};
  }
`

export const MockBadge = styled.span`
  display: inline-block;
  margin: 10px 16px 0;
  padding: 4px 10px;
  border-radius: ${props => props.theme?.utils?.radius?.s}px;
  background-color: ${props => props.theme.colors.warning100};
  color: ${props => props.theme.colors.darkTextColor};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
`
