import {
  css
} from 'lit-element';

export default css `
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
    padding: 32px 28px;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    font-size: 22px;
    line-height: normal;
    margin: auto;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
`;