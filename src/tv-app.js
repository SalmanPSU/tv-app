// import stuff
import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import "@lrnwebcomponents/video-player/video-player.js";
import "./tv-channel.js";

export class TvApp extends LitElement {
  // defaults
  constructor() {
    super();
    this.name = '';
    this.source = new URL('../assets/channels.json', import.meta.url).href;
    this.listings = [];
    this.temporaryItem = {
      id: null,
      title: null,
      presenter: null,
      time: null,
      description: null,
      video: null
    }
    this.activeItem = {
      id: null,
      title: null,
      presenter: null,
      time: null,
      description: null,
      video: null
    }
  }
  // convention I enjoy using to define the tag's name
  static get tag() {
    return 'tv-app';
  }
  // LitElement convention so we update render() when values change
  static get properties() {
    return {
      name: { type: String },
      source: { type: String },
      listings: { type: Array },
      temporaryItem: {type: Object },
      activeItem: { type: Object }
    };
  }
  // LitElement convention for applying styles JUST to our element
  static get styles() {
    return [
      css`
      :host {
        display: block;
      }
      header {
        color: #000;
        padding: 16px;
        text-align: center;
      }

      .h1 {
        font-size: 32px;
        margin-bottom: 16px;
      }

      .channel-container {
        margin-left: 16px;
        max-width: 96%;
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: auto;
      }

      .player-container {
        margin: 32px 0 0 16px;
        border-radius: 8px;
        display: inline-flex;
        height: 600px;
      }

      .player {
        width: 900px;
        height: 600px;
      }

      .discord {
        margin-left: 32px;
        width: 450px;
      }

      .discord widgetbot {
        display: inline-block;
        overflow: hidden;
        background-color: rgb(54, 57, 62);
        border-radius: 8px;
        vertical-align: top;
        width: 100%;
        height: 100%;
      }

      .discord iframe {
        border: none;
        width: 100%;
        height: 100%;
      }

      #description {
        margin-left: 16px;
        width: 900px;
        cursor: default;
      }

      @media(max-width: 999px) {
        .discord widgetbot {
          display: none;
        }
      }
      .
      `,
    ];
  }
  // LitElement rendering template of your element
  render() {
    return html`
    <header><h2>${this.name}</h2></header>
      <div class="channel-container">
        ${
          this.listings.map(
            (item) => html`
              <tv-channel 
                id="${item.id}"
                title="${item.title}"
                presenter="${item.metadata.author}"
                description="${item.description}"
                video="${item.metadata.source}"
                time="${item.metadata.time}"
                @click="${this.openDialog}">
              </tv-channel>
          `
        )
      }
      </div>
      <div class="player-container">
        <!-- video -->
        <video-player class="player" 
          source="${this.createSource()}" 
          accent-color="blue">
        </video-player>
        <!-- discord / chat - optional -->
        <div class="discord">
          <widgetbot server="954008116800938044" channel="1106691466274803723" width="100%" height="100%"><iframe title="WidgetBot Discord chat embed" allow="clipboard-write; fullscreen" src="https://e.widgetbot.io/channels/954008116800938044/1106691466274803723?api=a45a80a7-e7cf-4a79-8414-49ca31324752"></iframe></widgetbot>
          <script src="https://cdn.jsdelivr.net/npm/@widgetbot/html-embed"></script>
        </div>
      </div>
      <!-- description -->
      <tv-channel id="description" title="${this.activeItem?.title ?? ''}" presenter="${this.activeItem.author}" time="${this.activeItem.time ?? ''}">
        <p>${this.activeItem.description}</p>
      </tv-channel>
      <!-- dialog -->
      <sl-dialog label="${this.temporaryItem.title ?? ''}" class="dialog">
        <h5>${this.temporaryItem.presenter}</h5>
        <p class="dialog-description">
          ${this.temporaryItem.description}
        </p>
        <sl-button slot="footer" variant="primary" @click="${this.watchButton}">Watch</sl-button>
      </sl-dialog>
    `;
  }

  changeVideo() {
    const iframe = this.shadowRoot.querySelector('video-player').querySelector('iframe');
    iframe.src = this.createSource();
  }

  extractVideoId(link) {
    try {
      const url = new URL(link);
      const searchParams = new URLSearchParams(url.search);
      return searchParams.get("v");
    } catch (error) {
      console.error("Invalid URL:", link);
      return null;
    }
  }
  
  createSource() {
    return "https://www.youtube.com/embed/" + this.extractVideoId(this.activeItem.video);
  }

  openDialog(e) {
    this.temporaryItem = {
      id: e.target.id,
      title: e.target.title,
      presenter: e.target.presenter,
      time: e.target.time,
      description: e.target.description,
      video: e.target.video
    }
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.show();
  }
  
  closeDialog() {
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.hide();
  }

  watchButton(e) {
    this.activeItem = {
      id: this.temporaryItem.id,
      title: this.temporaryItem.title,
      presenter: this.temporaryItem.presenter,
      time: this.temporaryItem.time,
      description: this.temporaryItem.description,
      video: this.temporaryItem.video
    }
    this.shadowRoot.querySelector('video-player').shadowRoot.querySelector('a11y-media-player').play();
    this.closeDialog();
  }

  // LitElement life cycle for when any property changes
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "source" && this[propName]) {
        this.updateSourceData(this[propName]);
      }
    });
  }

  async updateSourceData(source) {
    await fetch(source).then((resp) => resp.ok ? resp.json() : []).then((responseData) => {
      if (responseData.status === 200 && responseData.data.items && responseData.data.items.length > 0) {
        this.listings = [...responseData.data.items];
      }
    });
  }
}
// tell the browser about our tag and class it should run when it sees it
customElements.define(TvApp.tag, TvApp);