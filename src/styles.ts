import { css } from 'lit';

export default css`
  :host 
  {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  ha-card 
  {
    flex-direction: column;
    flex: 1;
    position: relative;
    padding: 0px;
    border-radius: var(--ha-card-border-radius, 4px);
    overflow: hidden;
  }

  a
  {
    color: var(--secondary-text-color);
  }

  .container 
  {
    background: var(--card-background-color);
    cursor: pointer;
    overflow: hidden;
    position: relative;
  }

  .content
  {
    display: flex;
    padding: 36px 28px;
    justify-content: center;
  }

  .main-icon
  {
    --mdc-icon-size: 50px;
    height: 50px;
    flex: 0;
  }

  .headline
  {
    flex: 1;
    font-size: 22px;
    line-height: normal;
    margin: auto;
    margin-left: 18px;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .caption {
    top: 0;
    right: 0;
    position: absolute;
    display: flex;
    align-items: center;
    margin: 10px 12px;
    font-size: 13px;
    line-height: normal;
  }

  .caption-icon
  {
    --mdc-icon-size: 19px;
    height: 19px;
    flex: 0;
    margin-left: 5px;
  }

  .headline-narrow, .headline-verynarrow
  {
    display: none;
  }

  .swiper {
    --swiper-pagination-bullet-size: 5px;
  }

  .swiper-pagination-bullet {
    background-color: #dfdfdf;
  }
  .swiper-pagination-bullet-active {
    background-color: #ffffff;
  }
`;
