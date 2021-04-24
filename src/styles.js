import { css } from 'lit-element';

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
    border-radius: 4px;
    overflow: hidden;
  }

  .container 
  {
    background: var(--card-background-color);
    padding: 32px 42px;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    display: flex;
  }
  .main-icon 
  {
    --mdc-icon-size: 50px;
    height: 50px;
    flex: 0;
    margin-right: 18px;
  }
  .status
  {
    font-size: 22px;
    flex: 1;
    margin: auto;
    text-align: center;
  }

  .container.not-available {
    filter: grayscale(1);
  }
`;
