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
    cursor: pointer;
    overflow: hidden;
    position: relative;
  }
  .content
  {
    display: flex;
    padding: 32px 42px;
  }
  
  .content:not(:first-child)
  {
    padding-top: 0px;
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
    color: var(--text-primary-color);
  }

  .container.not-available {
    filter: grayscale(1);
  }

  .header
  {
    padding: 12px 16px 16px;
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: var(--text-primary-color);
  }
  .title
  {
    text-align: center;
  }

`;
