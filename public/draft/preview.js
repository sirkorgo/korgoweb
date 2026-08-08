CMS.registerPreviewStyle("/css/global.css", { raw: true });
CMS.registerPreviewStyle("/css/post.css", { raw: true });

function injectFonts(doc) {
  if (!doc || doc.getElementById("cms-fonts")) return;

  const style = doc.createElement("style");
  style.id = "cms-fonts";
  style.innerHTML = `
    @import url("https://fonts.googleapis.com/css2?family=Cabin+Condensed:wght@400;500;600;700&family=Cabin:ital,wght@0,400..700;1,400..700&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");
  `;
  doc.head.appendChild(style);
}

const ArtPreview = createClass({
  componentDidMount: function () {
    if (this.props.document) {
      this.props.document.documentElement.className = "default light canvas";
      injectFonts(this.props.document);
    }
  },
  render: function () {
    const entry = this.props.entry;
    const title = entry.getIn(["data", "title"]) || "Untitled Art";
    const rawDate = entry.getIn(["data", "date"]);
    const imagePath = entry.getIn(["data", "image"]);
    const imageAsset = imagePath ? this.props.getAsset(imagePath) : null;
    const body = this.props.widgetFor("body");

    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

    return h(
      "div",
      { className: "page", style: { minHeight: "fit-content" } },
      h(
        "section",
        { className: "pageHeader" },
        h("button", { className: "generic-btn" }, "← Go Back"),
        h("p", {}, h("b", {}, title)),
        h(
          "span",
          { style: { display: "flex", gap: "0" } },
          h(
            "button",
            {
              className: "generic-btn",
              style: { borderRadius: "4px 0px 0px 4px !important", borderRight: "none" },
            },
            "←",
          ),
          h(
            "button",
            {
              className: "generic-btn",
              style: { borderRadius: "0px 4px 4px 0px !important", borderLeft: "none" },
            },
            "→",
          ),
        ),
      ),
      h("hr", {}),
      h(
        "section",
        { className: "artPage", style: { gap: "15px" } },
        h(
          "div",
          { id: "art-content" },
          imageAsset ? h("img", { src: imageAsset.toString(), alt: title }) : null,
        ),
        h(
          "span",
          { className: "sidebar" },
          h(
            "span",
            {},
            h("h2", {}, title),
            formattedDate ? h("p", {}, `Created on ${formattedDate}`) : null,
            h("br", {}),
            body,
          ),
        ),
      ),
    );
  },
});

const BlogPreview = createClass({
  componentDidMount: function () {
    if (this.props.document) {
      this.props.document.documentElement.className = "default light blog";
      injectFonts(this.props.document);
    }
  },
  render: function () {
    const entry = this.props.entry;
    const title = entry.getIn(["data", "title"]) || "Untitled Post";
    const author = entry.getIn(["data", "author"]) || "sirkorgo";
    const rawDate = entry.getIn(["data", "date"]);
    const body = this.props.widgetFor("body");

    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

    return h(
      "div",
      { className: "page" },
      h(
        "section",
        { className: "pageHeader" },
        h("button", { className: "generic-btn" }, "← Go Back"),
        h("p", {}, h("b", {}, `${formattedDate} • ${title}`)),
      ),
      h("hr", {}),
      h(
        "section",
        {},
        h("h2", {}, title),
        h("p", {}, `Posted on ${formattedDate}, by ${author}`),
        h("br", {}),
        body,
      ),
    );
  },
});

const ComicPreview = createClass({
  componentDidMount: function () {
    if (this.props.document) {
      this.props.document.documentElement.className = "default light comics";
      injectFonts(this.props.document);
    }
  },
  render: function () {
    const entry = this.props.entry;
    const series = entry.getIn(["data", "series"]) || "Comic";
    const chapter = entry.getIn(["data", "chapter"]) || "1";
    const body = this.props.widgetFor("body");

    return h(
      "div",
      { className: "pageContainer" },
      h(
        "main",
        { className: "page" },
        h(
          "span",
          { className: "comicHeader" },
          h("button", { className: "generic-btn" }, "← Go Back"),
          h("p", {}, h("b", {}, `${series} • Chapter ${chapter}`)),
          h("select", { className: "dropdown" }, h("option", { value: "#" }, `Chapter ${chapter}`)),
        ),
        h("hr", {}),
        h("br", {}),
        h("span", { className: "comicContent" }, body),
      ),
    );
  },
});

CMS.registerPreviewTemplate("art", ArtPreview);
CMS.registerPreviewTemplate("blog", BlogPreview);
CMS.registerPreviewTemplate("cloudspace", ComicPreview);
CMS.registerPreviewTemplate("meantime", ComicPreview);
