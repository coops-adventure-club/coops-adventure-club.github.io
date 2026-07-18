import Image from "@11ty/eleventy-img";
import fs from "node:fs";

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

  eleventyConfig.addFilter("eventTicketImage", function (slug) {
    if (!slug) {
      return "";
    }

    const extensions = [".jpg", ".jpeg", ".png", ".webp"];

    const hasOriginal = extensions.some((extension) =>
      fs.existsSync(`src/images/originals/${slug}${extension}`)
    );

    if (!hasOriginal) {
      return "";
    }

    return `/images/generated/${slug}-400.webp`;
  });

  eleventyConfig.addFilter("dateToISO", (date) => {
    return date.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("hasEventImage", function (slug) {
    if (!slug) {
      return false;
    }

    const extensions = [".jpg", ".jpeg", ".png", ".webp"];

    return extensions.some((extension) =>
      fs.existsSync(`src/images/originals/${slug}${extension}`)
    );
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

eleventyConfig.addAsyncShortcode(
  "eventImage",
  async function (src, variant = "ticket") {
    const width = variant === "hero" ? 1200 : 400;
   
    const extensions = [".jpg", ".jpeg", ".png", ".webp"];

    let sourceImage;

    for (const extension of extensions) {
      const candidate = `src/images/originals/${src}${extension}`;

      if (fs.existsSync(candidate)) {
        sourceImage = candidate;
        break;
      }
    }

    if (!sourceImage) {
      return "";
    }

    const metadata = await Image(sourceImage, {
      widths: [400, 1200],
      formats: ["webp"],
      outputDir: "_site/images/generated",
      urlPath: "/images/generated",

      filenameFormat: function (id, sourcePath, outputWidth, format) {
        return `${src}-${outputWidth}.${format}`;
      }
    });

    const className =
    variant === "hero"
    ? "event-hero-image"
    : "event-ticket-image";

    return Image.generateHTML(metadata, {
      alt: "",
      sizes: variant === "hero"
        ? "(min-width: 55rem) 55rem, 100vw"
        : "400px",
      loading: variant === "hero" ? "eager" : "lazy",
      decoding: "async",
      class: className
    });
  }
);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
}