import styled, { css } from 'styled-components'
import { darken } from 'polished'

export const LoginContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0 10px;
  box-sizing: border-box;

  flex-direction: column;

  ${({ isPopup }) => !isPopup && css`
    min-height: calc(100vh - 65px);
    min-height: calc(100dvh - 65px); /* dvh = visible viewport under mobile URL bars (vh fallback above) */
  `}

  @media (min-width: 768px) {
    flex-direction: row;
  }
`
const Side = styled.div`
  display: flex;
  width: 100%;
`

export const FormSide = styled(Side)`
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  @media (min-width: 992px) {
    width: ${({ isCustomerMode }) => isCustomerMode ? '55%' : '100%'};
    font-size: ${({ isPopup }) => isPopup ? '12px' : '1em'};
  }

  @media (min-width: 1200px){
    font-size: ${({ isPopup }) => isPopup ? '0.9em' : '1em'};
  }
`

export const Title = styled.h1`
  font-weight: 600;
  font-size: 36px;
  margin-top: 0;
  margin-bottom: 10px;
  color: ${props => props.theme.colors.darkTextColor};
`

export const HeroBand = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.brandYellow};
  box-sizing: border-box;
  padding: 10px 20px 36px;
  margin: -30px -20px 0;

  img {
    max-width: 150px;
    max-height: 70px;
    width: auto;
    height: auto;
  }

  @media (min-width: 769px) {
    border-radius: ${props => props.theme?.utils?.radius?.m}px ${props => props.theme?.utils?.radius?.m}px 0 0;
    margin: -30px -20px 0;
  }
`

export const FormCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ isCustomerMode }) => !isCustomerMode && css`
    position: relative;
    z-index: 1;
    background-color: ${props => props.theme.colors.backgroundPage};
    border-radius: ${props => props.theme?.utils?.radius?.m}px ${props => props.theme?.utils?.radius?.m}px 0 0;
    margin: -24px -20px 0;
    padding: 24px 20px 20px;
    box-shadow: 0px -6px 16px 0px rgba(0, 0, 0, 0.06);

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -14px;
      height: 28px;
      background-color: ${props => props.theme.colors.darkGreen};
      border-radius: 50%;
      z-index: -1;
    }
  `}
`

export const CardTitle = styled.h2`
  font-weight: 600;
  font-size: 20px;
  margin: 10px 0 20px;
  text-align: center;
  color: ${props => props.theme.colors.darkTextColor};
`

export const LegalText = styled.p`
  width: ${({ isPopup }) => isPopup ? '100%' : '80%'};
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: ${props => props.theme.colors.darkGray};
  margin: 20px 0 0;

  a {
    color: ${props => props.theme.colors.darkTextColor};
    font-weight: 600;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`

export const LoginWith = styled.div`
  width: ${({ isPopup }) => isPopup ? '100%' : '80%'};
  border-radius: ${props => props.theme?.utils?.radius?.m}px;
  font-size: 14px;
  margin-bottom: 10px;
  overflow-x: auto;

  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */

  &::-webkit-scrollbar {
    display: none;
  }

  .signup-tabs, .login-tabs {
    > div {
      display: flex;
      align-items: center;
    }
  }

  @media (min-width: 425px) {
    font-size: 18px;
  }

  @media (min-width: 768px) {
    font-size: 14px;
  }

  @media (min-width: 992px) {
    font-size: ${({ isPopup }) => isPopup ? '13px' : '14px'};
  }

  @media (min-width: 1200px) {
    ${({ isPopup }) => isPopup && css`
      font-size: 14px;
    `};
  }
`

export const FormInput = styled.form`
  width: ${({ isPopup }) => isPopup ? '100%' : '80%'};
  display: flex;
  flex-direction: column;

  input:not(:last-child) {
    margin: 5px 0px;
    padding: 12px 20px;
  }

  button {
    margin-top: 10px;
    padding: 12px 5px;
    border-radius: ${props => props?.theme?.utils?.radius?.m}px;
  }

  .phone_number {
    margin: 10px 0;
  }
`

export const RedirectLink = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0px;
  font-size: 17px;

  span {
    margin-right: 5px;
    color: black;
    ${props => props.theme?.rtl && css`
      margin-left: 5px;
      margin-right: 0px;
    `}
  }

  a {
    color: #0060df;
    text-decoration: none;
  }

  &.new-account {
    a {
      color: #0060df !important;
      text-decoration: none;
      &:link, &:visited {
        color: #0060df !important;
      }
      &:hover {
        text-decoration: underline !important;
      }
    }
  }

  * {
    margin: 0px;
    padding: 0px;
  }

  ${({ register }) => register && css`
    width: calc(95% - 20px);

    @media (min-width: 481px) {
      width: ${({ isPopup }) => isPopup ? 'calc(100% - 20px)' : 'calc(80% - 20px)'};
    }
  `}

  @media (min-width: 425px) {
    flex-direction: row;
  }

  @media (min-width: 768px) {
    font-size: 14px;
  }

  @media (min-width: 992px) {
    font-size: ${({ isPopup }) => isPopup ? '13px' : '18px'};
    flex-direction: row;
  }

  @media (min-width: 1200px) {
    ${({ isPopup }) => isPopup && css`
      font-size: 16px;
    `};
  }
`

export const SocialButtons = styled.div`
   width: ${({ isPopup }) => isPopup ? '100%' : '80%'};
   margin-top: 20px;

  ${({ isPopup }) => isPopup && css`
    display: flex;
    flex-direction: column;
    @media (min-width: 576px) {
      flex-direction: row;
      flex: 1;
      gap: 20px;
    }
  `}

  button {
    border: 2px solid #000000;
    width: 100%;
    height: fit-content;
    min-height: 60px;
    padding: 6px 5px;
    border-radius: ${props => props?.theme?.utils?.radius?.m}px;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;

    img {
      width: 16px;
    }

    svg {
      fill: #000000;
    }
  }
`

export const SkeletonSocialWrapper = styled.div`
  width: ${({ isPopup }) => isPopup ? '100%' : '80%'};
  span{
    border-radius: 30px;
    margin-bottom: 10px
  }
`

export const TogglePassword = styled.span`
  position: absolute;
  display: flex;
  align-items: center;
  font-weight: 300;
  color: #333;
  font-size: 24px;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);

  ${props => props.theme?.rtl && css`
    right: auto;
    left: 15px;
  `}
  span{
    cursor: pointer;
  }

  svg {
    font-size: 16px;
    color: ${props => props.theme.colors.lightGray};
  }
`

export const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 5px;

  input {
    box-sizing: border-box;
    width: 100%;
    padding-right: 40px !important;
    padding-left: 20px !important;
    margin: 10px 0;
    background-color: ${props => props.theme.colors.secundary};
    border-radius: ${props => props.theme?.utils?.radius?.m}px;
    box-shadow: none;
  }
`

export const PhoneInputWrapper = styled.div`
  width: 100%;

  .PhoneInput {
    box-shadow: none;
    border-radius: ${props => props.theme?.utils?.radius?.m}px;
    overflow: hidden;
  }

  .PhoneInputCountry {
    background-color: ${props => props.theme.colors.secundary} !important;
    box-shadow: none !important;
    border-radius: ${props => props.theme?.utils?.radius?.m}px 0 0 ${props => props.theme?.utils?.radius?.m}px !important;
  }

  .PhoneInputInput {
    background-color: ${props => props.theme.colors.secundary} !important;
    border-radius: 0 ${props => props.theme?.utils?.radius?.m}px ${props => props.theme?.utils?.radius?.m}px 0 !important;
    box-shadow: none !important;
  }
`

export const OtpWrapper = styled.div`
  width: 100%;

  .otp-container {
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 8px;
    margin-bottom: 20px;
    padding: 0 10px;

    .otp-input {
      flex: 1;
      max-width: 50px;
      min-width: 40px;
      height: 60px;
      border: 1px solid #CCC;
      border-radius: 8px;
      background-color: #FFF;
      outline: none;
      font-size: 20px;
      font-weight: bold;
      text-align: center;

      &:focus{
        border-color: ${() => darken(0.07, '#CCC')} !important;
      }

      &::placeholder,
      &::-webkit-input-placeholder {
        color: #DBDCDB;
      }
      &:-ms-input-placeholder {
        color: #DBDCDB;
      }
    }
  }

  @media (min-width: 768px) {
    .otp-container {
      margin: 20px;
      padding: 0 20px;
      gap: 12px;

      .otp-input {
        max-width: 70px;
        min-width: 40px;
        height: 60px;
        font-size: 22px;
      }
    }
  }
  @media (min-width: 1024px) {
    .otp-container {
      gap: 16px;

      .otp-input {
        max-width: 90px;
        min-width: 60px;
        height: 80px;
        font-size: 22px;
      }
    }
  }

  @media (min-width: 1366px) {
    .otp-container {

      .otp-input {
        max-width: 100px;
        min-width: 80px;
        height: 100px;
        font-size: 30px;
      }
    }
  }
`

export const CountdownTimer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  align-self: center;
  text-align: center;
  margin: 20px auto;

  span {
    &:first-child {
      font-size: 30px;
      font-weight: bold;
      color: ${props => props.theme.colors.primary}
    }
    &:last-child {
      font-size: 24px;
      color: #DBDCDB;
      cursor: pointer;
      :hover {
        color: ${() => darken(0.07, '#DBDCDB')} !important;
      }
      :active {
        color: ${() => darken(0.09, '#DBDCDB')} !important;
      }
    }
  }

`

export const ReCaptchaWrapper = styled.div`
  margin: 12px auto;
`

export const InputBeforeIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 0;
  display: flex;
  align-items: center;
  height: 100%;

  ${props => props.theme.rtl && css`
    right: 14px;
    left: initial;
  `}

  svg {
    font-size: 16px;
    color: ${props => props.theme.colors.lightGray};
  }
`

export const LoginDivider = styled.div`
  display: flex;
  align-items: center;
  width: ${({ isPopup }) => isPopup ? '100%' : '80%'};
  margin: 30px 0;

  p {
    margin: 0;
    width: 70px;
    font-size: 14px;
    color: #748194;
    text-align: center;
  }
`

export const DividerLine = styled.div`
  height: 1px;
  background: #E9ECEF;
  flex-grow: 1;
`

export const ValidationText = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: ${props => props.theme.colors.danger500};
`

export const LogotypeContainer = styled.div`
  margin-bottom: 50px;
`

export const HeroSide = styled(Side)`
  display: none;

  img{
    width: 95%;
    height: 80%;
  }
  @media (min-width: 992px) {
    width: 45%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.theme.colors.primaryContrast};

    img{
      max-width: 100%;
      height: auto;
    }
  }
`

export const ResendCode = styled.span`
  color: ${props => props.disabled ? props.theme.colors.disabled : props.theme.colors.primary};
  font-size: 24px;
  align-self: center;
  margin-bottom: 10px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`
