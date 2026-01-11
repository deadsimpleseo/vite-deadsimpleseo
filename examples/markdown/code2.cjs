var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

const React = __toESM(require("react"));
const ReactDOMServer = __toESM(require("react-dom/server"));

const DeadSimpleSEOReact = __toESM(require('deadsimpleseo-react'));

console.log('DeadSimpleSEOReact:', DeadSimpleSEOReact);

// external:deadsimpleseo-react
var require_deadsimpleseo_react = __commonJS({
  "external:deadsimpleseo-react"(exports2, module2) {
    module2.exports = require_deadsimpleseo_react();
  }
});

console.log('import_deadsimpleseo_react:', import_deadsimpleseo_react);

// vfs:/Users/tmeade/src/Projects/DeadSimpleSEO/vite-deadsimpleseo/examples/markdown/src/components/Header.tsx
function Header() {
  return /* @__PURE__ */ React.createElement("header", { style: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "1.5rem 2rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: "1.8rem", fontWeight: "bold" } }, "\u{1F680} DeadSimpleSEO"), /* @__PURE__ */ React.createElement("nav", { style: { display: "flex", gap: "2rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/", style: { color: "white", textDecoration: "none", fontWeight: "500" } }, "Home"), /* @__PURE__ */ React.createElement("a", { href: "/about/", style: { color: "white", textDecoration: "none", fontWeight: "500" } }, "About"), /* @__PURE__ */ React.createElement("a", { href: "/features/", style: { color: "white", textDecoration: "none", fontWeight: "500" } }, "Features"), /* @__PURE__ */ React.createElement("a", { href: "/blog/", style: { color: "white", textDecoration: "none", fontWeight: "500" } }, "Blog"))));
}

// vfs:/Users/tmeade/src/Projects/DeadSimpleSEO/vite-deadsimpleseo/examples/markdown/src/components/Footer.tsx
function Footer() {
  return /* @__PURE__ */ React.createElement("footer", { style: {
    background: "#1a1a2e",
    color: "#e0e0e0",
    padding: "3rem 2rem 1.5rem",
    marginTop: "auto"
  } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "1200px", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", marginBottom: "2rem" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { color: "white", marginBottom: "1rem" } }, "About"), /* @__PURE__ */ React.createElement("p", { style: { lineHeight: "1.6", color: "#b0b0b0" } }, "DeadSimpleSEO makes static SEO pages for React apps without complex SSR frameworks.")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { color: "white", marginBottom: "1rem" } }, "Quick Links"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0 } }, /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/", style: { color: "#b0b0b0", textDecoration: "none" } }, "Home")), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/about/", style: { color: "#b0b0b0", textDecoration: "none" } }, "About")), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/features/", style: { color: "#b0b0b0", textDecoration: "none" } }, "Features")), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/blog/", style: { color: "#b0b0b0", textDecoration: "none" } }, "Blog")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { color: "white", marginBottom: "1rem" } }, "Resources"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0 } }, /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/about/", style: { color: "#b0b0b0", textDecoration: "none" } }, "About ", /* @__PURE__ */ React.createElement("em", null, "vite-deadsimpleseo"))), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/docs/", style: { color: "#b0b0b0", textDecoration: "none" } }, "Documentation")), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/blog/", style: { color: "#b0b0b0", textDecoration: "none" } }, "Blog")), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/contact/", style: { color: "#b0b0b0", textDecoration: "none" } }, "Contact")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { color: "white", marginBottom: "1rem" } }, "Connect"), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", padding: 0 } }, /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "https://github.com", style: { color: "#b0b0b0", textDecoration: "none" } }, "GitHub")), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "https://twitter.com", style: { color: "#b0b0b0", textDecoration: "none" } }, "Twitter")), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "https://linkedin.com", style: { color: "#b0b0b0", textDecoration: "none" } }, "LinkedIn"))))), /* @__PURE__ */ React.createElement("div", { style: {
    borderTop: "1px solid #333",
    paddingTop: "1.5rem",
    textAlign: "center",
    color: "#808080",
    fontSize: "0.9rem"
  } }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, "\xA9 2026 DeadSimpleSEO. Built with \u2764\uFE0F using Vite + React."))));
}

// vfs:/Users/tmeade/src/Projects/DeadSimpleSEO/vite-deadsimpleseo/examples/markdown/src/App.tsx
var import_deadsimpleseo_react = __toESM(require_deadsimpleseo_react());
function MainPage() {
  return /* @__PURE__ */ React.createElement("div", { className: "App", style: { maxWidth: "1200px", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("h1", null, "Vite + React + DeadSimpleSEO"), /* @__PURE__ */ React.createElement("p", null, "This is the main React application."), /* @__PURE__ */ React.createElement("p", null, "SEO pages are generated separately:"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/about/" }, "About Page")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/features/" }, "Features Page")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/blog/" }, "Blog Post (Markdown)"))));
}
function App() {
  const seoPage = (0, import_deadsimpleseo_react.useSEOPage)();
  const SEOPageComponent = (0, import_deadsimpleseo_react.useSEOPageComponent)();
  if (!seoPage || !SEOPageComponent) {
    return /* @__PURE__ */ React.createElement("div", null, "no SEO page or component");
  }
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement(Header, null), /* @__PURE__ */ React.createElement("main", { style: { flex: 1, padding: "3rem 2rem" } }, seoPage ? /* @__PURE__ */ React.createElement(SEOPageComponent, null) : /* @__PURE__ */ React.createElement(MainPage, null)), /* @__PURE__ */ React.createElement(Footer, null));
}
var App_default = App;

// vfs:main.tsx
console.log("App component imported in VM:", App_default);
var html = ReactDOMServer.renderToString(
  /* @__PURE__ */ React.createElement(App_default, null)
);
console.log("Rendered HTML in VM:", html);
setOutput(html);
