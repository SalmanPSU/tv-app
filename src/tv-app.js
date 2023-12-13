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
      <div style= "display: inline-flex;">
      ${this.activeItem.name}
        <!-- video -->
        <!-- <div>
        <iframe
          width="750"
          height="400"
          src="${this.createSource()}" 
          frameborder="0"
          allowfullscreen
        ></iframe>
        </div> -->
        <figure id="player-figure" class="image is-16by9">
                <iframe id="player" class="has-ratio box p-0" width="560" height="315" src="https://www.youtube.com/embed/QJMBhXjtaYU?enablejsapi=1" title="Teaching for Now and Planning for Later - Reclaim Open Online" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
              </figure>
        <!-- discord / chat - optional -->
        <div style= "margin-right: 300;">
        <iframe
          src="https://discord.com/widget?id=YOUR_DISCORD_SERVER_ID&theme=dark"
          width="400"
          height="800"
          display: inline-flex;
          allowtransparency="true"
          frameborder="0"
          (attribute)sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        ></iframe>
        </div>
      </div>
      <!-- dialog -->
      <sl-dialog label="Dialog" class="dialog">
      ${this.activeItem.title},
      ${this.activeItem.description}
        <sl-button slot="footer" variant="primary" @click="${this.closeDialog}">Close</sl-button>
      </sl-dialog>
    `;
  }

  changeVideo() {
    const iframe = this.shadowRoot.querySelector('iframe');
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

  closeDialog(e) {
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.hide();
  }

  itemClick(e) {
    console.log(e.target);
    const dialog = this.shadowRoot.querySelector('.dialog');
    dialog.show();
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