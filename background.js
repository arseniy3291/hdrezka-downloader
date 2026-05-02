// Listen for ajax video requests on HDRezka
browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.method !== "POST" && details.method !== "GET") return {};

    // Use filterResponseData available only in Firefox to read the JSON response
    if (typeof browser.webRequest.filterResponseData === "function") {
      try {
        let filter = browser.webRequest.filterResponseData(details.requestId);
        let decoder = new TextDecoder("utf-8");
        let str = "";

        filter.ondata = event => {
          str += decoder.decode(event.data, {stream: true});
          filter.write(event.data); // Pass data unmodified
        };

        filter.onstop = event => {
          filter.close();
          try {
            let json = JSON.parse(str);
            if (json.url) {
              // Found video URLs, save them to local storage
              browser.storage.local.set({ lastVideoUrls: json.url });
              console.log("HDRezka Downloader: Captured URLs via AJAX.");
            }
          } catch (e) {
            // Not a JSON response or failed to parse
          }
        };
      } catch (e) {
        // filterResponseData throws if the request is already being filtered by another extension
      }
    }
    return {};
  },
  {urls: ["*://*/ajax/get_cdn_video/*", "*://*/ajax/get_cdn_series/*", "*://*/ajax/get_cdn_series/?*"]},
  ["blocking"] // Required to use filterResponseData
);
