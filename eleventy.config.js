export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addFilter("readableDate", (date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  });

  eleventyConfig.addFilter("dateToISO", (date) => {
    return date.toISOString().slice(0, 10);
  });

  eleventyConfig.addCollection("eventsByDate", (collectionApi) => {
  const events = collectionApi
    .getFilteredByGlob("src/events/**/*.md")
    .sort((a, b) => b.date - a.date);

  const groupedEvents = [];

  for (const event of events) {
    const year = event.date.getFullYear();

    let group = groupedEvents.find(group => group.year === year);

    if (!group) {
      group = {
        year,
        events: []
      };

      groupedEvents.push(group);
    }

    group.events.push(event);
  }

  return groupedEvents;
});

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
}