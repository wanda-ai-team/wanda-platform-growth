import mixpanel, { Dict, Query } from "mixpanel-browser";

const isProd = process.env.NEXT_PUBLIC_NODE_ENV === "PROD";

mixpanel.init(process.env.PUBLIC_NEXT_MIXPANEL_TOKEN !== undefined ? process.env.PUBLIC_NEXT_MIXPANEL_TOKEN : "", { debug: true, track_pageview: true, persistence: 'localStorage' })

export const Mixpanel = {
  identify: (id: string) => {
    mixpanel.identify(id);
  },
  alias: (id: string) => {
    mixpanel.alias(id);
  },
  track: (name: string, props?: Dict) => {
    mixpanel.track(name, props);
  },
  track_links: (query: Query, name: string) => {
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