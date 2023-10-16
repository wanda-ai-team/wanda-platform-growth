import mixpanel, { Dict, Query } from "mixpanel-browser";

const isProd = process.env.NEXT_PUBLIC_NODE_ENV === "PROD";

isProd ? mixpanel.init("075d053075b2ab60a4d2de0e45b2100a", { debug: true, track_pageview: true, persistence: 'localStorage' }) : ""

export const Mixpanel = {
  identify: (id: string) => {
    if (!isProd) return console.log("Mixpanel track", id)
    mixpanel.identify(id);
  },
  alias: (id: string) => {
    if (!isProd) return console.log("Mixpanel track", id)
    mixpanel.alias(id);
  },
  track: (name: string, props?: Dict) => {
    if (!isProd) return console.log("Mixpanel track", name, props)
    mixpanel.track(name, props);
  },
  track_links: (query: Query, name: string) => {
    if (!isProd) return console.log("Mixpanel track", query)
    mixpanel.track_links(query, name, {
      referrer: document.referrer,
    });
  },
  people: {
    set: (props: Dict) => {
      mixpanel.people.set(props);
    },
  },
};