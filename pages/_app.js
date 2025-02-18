import "./stylesheets/App.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "~/components/CKEditor/CKEditor.css";
import "~/components/EditorsDashboard/stylesheets/date.css";
import "~/components/Modals/Stylesheets/Dnd.css";
import "~/components/Paper/progressbar.css";
import "~/components/Paper/Tabs/stylesheets/custom-editor.css";
import "~/components/Paper/Tabs/stylesheets/ReactPdf.css";
import "~/components/SearchSuggestion/authorinput.css";
import "~/components/TextEditor/stylesheets/QuillTextEditor.css";
import "~/pages/user/stylesheets/toggle.css";
import "isomorphic-unfetch";
import "katex/dist/katex.min.css";
import "react-placeholder/lib/reactPlaceholder.css";
import "react-quill/dist/quill.snow.css";
import "react-tagsinput/react-tagsinput.css";
import "~/components/Comment/lib/quill.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Analytics } from "@vercel/analytics/react";
import { configureStore } from "~/redux/configureStore";
import { init as initApm } from "@elastic/apm-rum";
import { MessageActions } from "~/redux/message";
import { Provider } from "react-redux";
import { SIFT_BEACON_KEY } from "~/config/constants";
import { useEffect, useRef, useState } from "react";
import App from "next/app";
import Base from "./Base";
import nookies from "nookies";
import Router, { useRouter } from "next/router";
import withRedux from "next-redux-wrapper";
import Script from "next/script";

if (process.env.ELASTIC_APM_URL) {
  initApm({
    // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
    serviceName:
      process.env.REACT_APP_ENV === "staging"
        ? "researchhub-staging-web"
        : process.env.NODE_ENV === "production"
        ? "researchhub-production-web"
        : "researchhub-development-web",
    environment:
      process.env.REACT_APP_ENV === "staging"
        ? "staging"
        : process.env.NODE_ENV === "production"
        ? "production"
        : "development",
    // Set custom APM Server URL (default: http://localhost:8200)
    serverUrl: process.env.ELASTIC_APM_URL,

    // Set service version (required for sourcemap feature)
    serviceVersion: process.env.SENTRY_RELEASE,
  });
}

const MyApp = ({
  Component,
  pageProps,
  rootLeftSidebarForceMin,
  store,
  appProps,
}) => {
  const router = useRouter();
  const [prevPath, setPrevPath] = useState(router.asPath);

  const showLoader = useRef();

  // Scroll to top on page change
  useEffect(() => {
    if (prevPath !== router.pathname) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }

    setPrevPath(router.pathname);
  }, [router.asPath]);

  useEffect(() => {
    connectSift();

    router.events.on("routeChangeStart", (url) => {
      showLoader.current = setTimeout(() => {
        store.dispatch(MessageActions.setMessage(""));
        store.dispatch(MessageActions.showMessage({ show: true, load: true }));
      }, 200);
    });

    router.events.on("routeChangeComplete", (url) => {
      connectSift();
      clearTimeout(showLoader.current);
      store.dispatch(MessageActions.showMessage({ show: false }));
    });

    Router.events.on("routeChangeError", () => {
      store.dispatch(MessageActions.showMessage({ show: false }));
    });
    return () => {
      window.removeEventListener("load", loadSift);
    };
  }, []);

  const connectSift = () => {
    let auth = getAuthProps();
    if (auth.isLoggedIn) {
      let _user_id = auth.user.id || "";
      let _session_id = uniqueId();
      let _sift = (window._sift = window._sift || []);
      _sift.push(["_setAccount", SIFT_BEACON_KEY]);
      _sift.push(["_setUserId", _user_id]);
      _sift.push(["_setSessionId", _session_id]);
      _sift.push(["_trackPageview"]);

      if (window.attachEvent) {
        window.attachEvent("onload", loadSift);
      } else {
        window.addEventListener("load", loadSift, false);
      }

      loadSift();
    } else {
      disconnectSift();
    }
  };

  const getAuthProps = () => {
    return store.getState().auth;
  };

  const disconnectSift = () => {
    let sift = document.getElementById("sift");
    sift && sift.parentNode.removeChild(sift);
  };

  const loadSift = () => {
    if (!document.getElementById("sift")) {
      // only attach script if it isn't there
      let script = document.createElement("script");
      script.setAttribute("id", "sift");
      script.src = "https://cdn.sift.com/s.js";
      document.body.appendChild(script);
    }
  };

  const uniqueId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  return (
    <Provider store={store}>
      <Base
        Component={Component}
        pageProps={pageProps}
        appProps={appProps}
        rootLeftSidebarForceMin={rootLeftSidebarForceMin}
      />
      <Analytics />
    </Provider>
  );
};

// FIXME: This approach is only needed while there are pages containg
// getStaticProps or getServerSideProps and also others containing getInitialProps. Once all calls
// to getInitialProps removed, this can be removed safely.
MyApp.getInitialProps = async (appContext) => {
  const staticOrServerSidePropsPaths = [
    "/",
    "/live",
    "/hubs",
    "/user/[authorId]/[tabName]",
    "/[orgSlug]/notebook/[noteId]",
    "/[orgSlug]/notebook",
    "/hubs/[slug]",
    "/hubs/[slug]/live",
    "/paper/[documentId]/[documentSlug]",
    "/paper/[documentId]/[documentSlug]/[tabName]",
    "/post/[documentId]/[documentSlug]",
    "/post/[documentId]/[documentSlug]/[tabName]",
    "/notebook",
  ];
  const cookies = nookies.get(appContext.ctx);
  const rootLeftSidebarForceMin = false;

  // Kobe 12-07-22: Removing this cookie setting because it causes performance issues.
  // Leaving this code intact until we are fully ready to remove it
  // and the other part of it in RootLeftSidebar.tsx
  // cookies[LEFT_SIDEBAR_FORCE_MIN_KEY] ===
  // "true"; /* intentional string literal */

  if (
    process.browser ||
    !staticOrServerSidePropsPaths.includes(appContext.router.route)
  ) {
    const appProps = await App.getInitialProps(appContext);
    return { ...appProps, rootLeftSidebarForceMin };
  } else {
    return {
      rootLeftSidebarForceMin,
    };
  }
};

export default withRedux(configureStore)(MyApp);
