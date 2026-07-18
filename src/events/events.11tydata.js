export default {
  layout: "layouts/event.njk",
  tags: ["events"],
  permalink: data => `/events/${data.page.fileSlug}/`
};