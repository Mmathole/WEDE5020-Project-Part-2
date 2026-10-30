const aboutPage = document.querySelector(".about-page");

// ABOUT PAGE: scroll reveals, accessible tabs, the regional map, and the photo lightbox.
// The About page has extra interactions that do not exist on the rest of the site.
// Checking for its body class keeps those features from running on unrelated pages.
if (aboutPage) {
    // CSS keeps enhanced sections hidden until this script starts. Adding this class
    // turns on those styles only when JavaScript is available to reveal the sections.
    aboutPage.classList.add("js-enabled");

    const revealItems = aboutPage.querySelectorAll(".reveal");
    // Reveal each section as it scrolls into view instead of animating the whole page at once.
    // The threshold means the observer waits until a small part of a section is visible.
    // If the browser lacks IntersectionObserver, show everything so content never stays hidden.
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const tabsContainer = aboutPage.querySelector("[data-tabs]");
    if (tabsContainer) {
        const tabs = Array.from(tabsContainer.querySelectorAll('[role="tab"]'));
        const panels = Array.from(tabsContainer.querySelectorAll('[role="tabpanel"]'));

        // A tab's ARIA state, keyboard stop, and matching content panel must always agree.
        const activateTab = (selectedTab, moveFocus = false) => {
            tabs.forEach((tab) => {
                // Roving tabindex leaves only the active tab in the normal Tab key order.
                const isSelected = tab === selectedTab;
                tab.setAttribute("aria-selected", String(isSelected));
                tab.tabIndex = isSelected ? 0 : -1;
            });

            panels.forEach((panel) => {
                // The selected tab points to its panel through aria-controls.
                panel.hidden = panel.id !== selectedTab.getAttribute("aria-controls");
            });

            if (moveFocus) {
                selectedTab.focus();
            }
        };

        // The HTML hides the interactive tabs until their click and keyboard behavior is ready.
        // This leaves the readable non-JavaScript version available if setup cannot run.
        tabsContainer.hidden = false;
        activateTab(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);

        // Arrow keys move between tabs and wrap at either end; Home and End jump to the ends.
        // Focusing the new tab makes keyboard navigation match the visible selection.
        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => activateTab(tab));
            tab.addEventListener("keydown", (event) => {
                let nextIndex;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    nextIndex = (index + 1) % tabs.length;
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    nextIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (event.key === "Home") {
                    nextIndex = 0;
                } else if (event.key === "End") {
                    nextIndex = tabs.length - 1;
                } else {
                    return;
                }

                event.preventDefault();
                activateTab(tabs[nextIndex], true);
            });
        });
    }

    const mapElement = aboutPage.querySelector("#impact-map");
    const mapStatus = aboutPage.querySelector("#map-status");
    if (mapElement && mapStatus) {
        // Leaflet is loaded from a CDN, so keep the country list useful if it is unavailable.
        if (window.L) {
            const map = window.L.map(mapElement, {
                scrollWheelZoom: false
            }).setView([-27.8, 29.3], 4);

            const tileLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // These city coordinates help orient the regional map; they are illustrative,
            // not exact office or project locations, so the marker text makes that clear.
            const countryMarkers = [
                {
                    name: "South Africa",
                    city: "Pretoria",
                    coordinates: [-25.7479, 28.2293]
                },
                {
                    name: "Mozambique",
                    city: "Maputo",
                    coordinates: [-25.9692, 32.5732]
                },
                {
                    name: "Lesotho",
                    city: "Maseru",
                    coordinates: [-29.3158, 27.4866]
                }
            ];

            countryMarkers.forEach((location) => {
                const popup = document.createElement("div");
                const title = document.createElement("strong");
                title.textContent = location.name;
                popup.append(title, document.createElement("br"));
                popup.append(`${location.city} is shown as an illustrative regional reference point, not a confirmed project site.`);

                // Use text nodes for marker content so location text is displayed as text,
                // rather than being interpreted by the browser as HTML.
                window.L.marker(location.coordinates)
                    .addTo(map)
                    .bindPopup(popup);
            });

            mapStatus.textContent = "Interactive map loaded. Select a marker for more information.";
            // The map library can load even when the map imagery cannot, so report tile
            // failures separately and keep the country names available in the status.
            tileLayer.on("tileerror", () => {
                mapStatus.textContent = "Map tiles could not be loaded. The countries served are South Africa, Mozambique and Lesotho.";
            });
        } else {
            mapStatus.textContent = "Interactive map unavailable. The countries served are South Africa, Mozambique and Lesotho.";
        }
    }

    const gallery = aboutPage.querySelector("[data-gallery]");
    const lightbox = aboutPage.querySelector(".lightbox");
    // The native dialog API supplies focus handling and Escape-to-close behavior.
    // Leave the gallery as ordinary buttons if this browser does not support that API.
    if (gallery && lightbox && typeof lightbox.showModal === "function") {
        const galleryItems = Array.from(gallery.querySelectorAll("[data-gallery-image]"));
        const lightboxImage = lightbox.querySelector(".lightbox-image");
        const lightboxCaption = lightbox.querySelector(".lightbox-caption");
        const closeButton = lightbox.querySelector(".lightbox-close");
        let currentImageIndex = 0;

        // Keep the selected image, its alt text, and its visible caption in step.
        // The modulo calculation wraps from the final photo to the first and back again.
        const showImage = (index) => {
            currentImageIndex = (index + galleryItems.length) % galleryItems.length;
            const selectedItem = galleryItems[currentImageIndex];
            lightboxImage.src = selectedItem.dataset.galleryImage;
            lightboxImage.alt = selectedItem.querySelector("img").alt;
            lightboxCaption.textContent = selectedItem.dataset.galleryCaption;
        };

        // Listen on the gallery container so clicks on a button's image or caption still
        // open the correct photo without attaching a separate handler to every child.
        gallery.addEventListener("click", (event) => {
            const selectedItem = event.target.closest("[data-gallery-image]");
            if (!selectedItem) {
                return;
            }

            showImage(galleryItems.indexOf(selectedItem));
            lightbox.showModal();
            closeButton.focus();
        });

        lightbox.querySelector(".lightbox-previous").addEventListener("click", () => {
            showImage(currentImageIndex - 1);
        });
        lightbox.querySelector(".lightbox-next").addEventListener("click", () => {
            showImage(currentImageIndex + 1);
        });
        closeButton.addEventListener("click", () => lightbox.close());
        // A dialog receives clicks on its backdrop as well as its contents; close it only
        // when the backdrop itself was clicked, so interacting with the photo won't dismiss it.
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                lightbox.close();
            }
        });
        lightbox.addEventListener("keydown", (event) => {
            // Let keyboard users browse images without closing the dialog or using its buttons.
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showImage(currentImageIndex - 1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                showImage(currentImageIndex + 1);
            }
        });
    }
}

const programsGrid = document.querySelector("[data-program-grid]");
const programControls = document.querySelector("[data-program-controls]");
const programResults = document.querySelector("[data-program-results]");

// PROGRAMS PAGE: search, focus filtering, alphabetical sorting, and result announcements.
// Search and filter controls are only present on the Programs page.
// The original cards stay in the HTML as a useful fallback until this setup is complete.
if (programsGrid && programControls && programResults) {
    // Keep the program details in one data list; each change to search, focus, or sort
    // uses this same source to build a consistent set of result cards.
    const programs = [
        {
            title: "School Feeding",
            description: "Providing nutritious meals each school day so children can learn, focus, and thrive.",
            category: "nutrition"
        },
        {
            title: "Community Outreach",
            description: "Supporting families and schools with food security programs and local community partnerships.",
            category: "community"
        },
        {
            title: "Advocacy & Awareness",
            description: "Helping communities understand the link between nutrition, health, and education.",
            category: "advocacy"
        }
    ];

    const searchInput = programControls.querySelector("#program-search");
    const categorySelect = programControls.querySelector("#program-category");
    const sortSelect = programControls.querySelector("#program-sort");

    const renderPrograms = () => {
        // Read all three controls together, then apply both filters before sorting the matches.
        // Searching both title and description lets visitors find programs by topic words.
        const searchTerm = searchInput.value.trim().toLocaleLowerCase();
        const selectedCategory = categorySelect.value;
        const sortOrder = sortSelect.value;

        const matchingPrograms = programs
            .filter((program) => {
                // A program must match both the text query and the selected focus area.
                const matchesSearch = `${program.title} ${program.description}`
                    .toLocaleLowerCase()
                    .includes(searchTerm);
                const matchesCategory = selectedCategory === "all" || program.category === selectedCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((first, second) => {
                // localeCompare gives a consistent alphabetic comparison; reversing its
                // result produces the descending order without changing the source list.
                const nameOrder = first.title.localeCompare(second.title);
                return sortOrder === "za" ? -nameOrder : nameOrder;
            });

        // Create the result cards with DOM elements and textContent so program copy is
        // rendered literally, not parsed as markup.
        const cards = matchingPrograms.map((program) => {
            const card = document.createElement("article");
            const title = document.createElement("h2");
            const description = document.createElement("p");
            const category = document.createElement("p");

            card.className = "card";
            title.textContent = program.title;
            description.textContent = program.description;
            category.className = "program-category";
            category.textContent = `Focus: ${program.category}`;
            card.append(title, description, category);
            return card;
        });

        // Replace the old cards as one operation so the grid always matches the latest filters.
        programsGrid.replaceChildren(...cards);

        if (matchingPrograms.length === 0) {
            // Keep the grid informative when filters remove every card instead of leaving
            // visitors to guess whether the search is still working.
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "program-empty";
            emptyMessage.textContent = "No programs match your search. Try another word or choose a different focus area.";
            programsGrid.append(emptyMessage);
        }

        const countLabel = matchingPrograms.length === 1 ? "program" : "programs";
        // This live status announces result-count changes to assistive technology too.
        programResults.textContent = `Showing ${matchingPrograms.length} ${countLabel}.`;
    };

    // Reveal the controls only when the renderer is ready; this avoids displaying filters
    // that cannot work if the script fails before setup is finished.
    programControls.hidden = false;
    renderPrograms();
    programControls.addEventListener("submit", (event) => event.preventDefault());
    searchInput.addEventListener("input", renderPrograms);
    categorySelect.addEventListener("change", renderPrograms);
    sortSelect.addEventListener("change", renderPrograms);
}

// CONTACT AND ENQUIRY FORMS: validate locally, send JSON, and report the server's reply.
const ajaxForms = document.querySelectorAll("[data-ajax-form]");

// The phone input accepts familiar punctuation, but must contain 7 to 15 actual digits.
// An empty value is valid only for the optional phone field on the contact form.
const validatePhoneField = (phoneField) => {
    // Count only numeric characters, while the separate character check rejects letters
    // and punctuation outside the set commonly used to format a phone number.
    const digits = phoneField.value.replace(/\D/g, "");
    const isOptionalAndEmpty = !phoneField.required && phoneField.value.trim() === "";
    const usesAllowedCharacters = /^[+0-9(). -]+$/.test(phoneField.value);
    const isValid = isOptionalAndEmpty
        || (usesAllowedCharacters && digits.length >= 7 && digits.length <= 15);

    // A custom validity message integrates this rule with the browser's normal form checks.
    phoneField.setCustomValidity(isValid ? "" : "Enter a phone number using only digits and common phone punctuation, with 7 to 15 digits.");
    phoneField.setAttribute("aria-invalid", String(!isValid));
    return isValid;
};

ajaxForms.forEach((form) => {
    // Each form can have a different set of optional features; look them up within the
    // current form so contact and enquiry behavior stays independent.
    const phoneField = form.querySelector('input[type="tel"]');
    const enquiryType = form.querySelector("[data-enquiry-type]");
    const response = form.querySelector("[data-enquiry-response]");
    const status = form.querySelector("[data-email-status]");
    const submitButton = form.querySelector('button[type="submit"]');

    if (phoneField) {
        // Validate while people edit and when they leave the field, so mistakes are
        // identified before submission instead of only after the send button is pressed.
        phoneField.addEventListener("input", () => validatePhoneField(phoneField));
        phoneField.addEventListener("blur", () => validatePhoneField(phoneField));
    }

    // Clear the visible invalid marker as soon as a field becomes valid again.
    form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.addEventListener("input", () => {
            if (field.matches(":valid")) {
                field.removeAttribute("aria-invalid");
            }
        });
        field.addEventListener("change", () => {
            if (field.matches(":valid")) {
                field.removeAttribute("aria-invalid");
            }
        });
    });

    // Native browser validation may stop submission before the submit handler runs.
    // Capture its invalid event so the same accessible error status is still shown.
    form.addEventListener("invalid", (event) => {
        event.target.setAttribute("aria-invalid", "true");
        status.className = "form-status form-status--error";
        status.textContent = event.target.validationMessage || "Please correct this field before sending.";
    }, true);

    if (enquiryType && response) {
        // Date inputs use the visitor's local calendar date as the earliest volunteer
        // start date, preventing selection of a date that has already passed.
        const today = new Date();
        const localToday = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");
        const volunteerDate = form.querySelector("#volunteer-date");
        // The date field is optional, but setting its minimum prevents picking a past date.
        volunteerDate.min = localToday;

        // Keep the short explanation connected to the selected enquiry. These answers
        // describe how the organization will respond; they do not promise fixed pricing
        // or availability that the site cannot verify.
        const enquiryResponses = {
            program: "We can share details about the program you choose. The site does not list a fixed cost or live capacity, so the team will confirm current arrangements.",
            volunteer: "Volunteer roles and start dates depend on current needs. The team can confirm which opportunities are available.",
            sponsor: "Sponsorship options and amounts depend on the proposed support and current priorities. The team can discuss suitable options with you.",
            general: "Tell us what you would like to know and the team can point you in the right direction."
        };

        // Show only fields that match the selected enquiry topic. Disabled hidden fields
        // are omitted from submission, and the relevant dropdown becomes required.
        const updateEnquiryFields = () => {
            const selectedTopic = enquiryType.value;
            form.querySelectorAll("[data-topic-fields]").forEach((group) => {
                const isRelevant = group.dataset.topicFields === selectedTopic;
                group.hidden = !isRelevant;
                group.querySelectorAll("input, select").forEach((field) => {
                    field.disabled = !isRelevant;
                    field.required = isRelevant && field.tagName === "SELECT";
                });
            });

            response.textContent = enquiryResponses[selectedTopic]
                || "Choose a topic to see what the team can help you with.";
        };

        enquiryType.addEventListener("change", updateEnquiryFields);
        // Apply the initial hidden/required states before the visitor touches the form.
        updateEnquiryFields();
    }

    form.addEventListener("submit", async (event) => {
        // The browser would normally navigate to the action URL after submission.
        // Prevent that navigation because fetch below sends the same data in the background.
        event.preventDefault();

        // Apply the custom phone rule first, then ask the browser to check required fields,
        // email format, and character limits before any data is sent to the server.
        if (phoneField && !validatePhoneField(phoneField)) {
            status.className = "form-status form-status--error";
            status.textContent = "Please enter a valid phone number before sending.";
            phoneField.reportValidity();
            return;
        }

        if (!form.reportValidity()) {
            // Focus the first problem so keyboard users can fix it immediately; the
            // captured invalid event above places its explanation in the live status.
            const firstInvalidField = form.querySelector(":invalid");
            firstInvalidField?.setAttribute("aria-invalid", "true");
            firstInvalidField?.focus();
            return;
        }

        const originalButtonText = submitButton.textContent;
        // FormData includes only enabled fields, so hidden topic-specific answers are not
        // accidentally sent. Convert the entries to JSON for the server endpoint.
        const formData = Object.fromEntries(new FormData(form).entries());
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        status.className = "form-status";
        status.textContent = "Sending your message securely...";

        try {
            // Send the message in the background to keep the visitor on this page.
            // The server performs its own validation and only reports success after delivery.
            const result = await fetch(form.action, {
                method: form.method.toUpperCase(),
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            // A server or proxy may return an empty/non-JSON error body; in that case use
            // the generic message below rather than failing while trying to read the reply.
            const reply = await result.json().catch(() => ({}));

            // Treat every non-2xx HTTP response as a failed submission and show the
            // specific explanation supplied by the backend when one is available.
            if (!result.ok) {
                throw new Error(reply.message || "We could not send your message. Please try again later.");
            }

            // Clear private form entries only after the server confirms receipt.
            // For an enquiry, dispatching change also hides the old topic-specific fields.
            status.className = "form-status form-status--success";
            status.textContent = reply.message || "Your message has been sent. The team will reply using the email address you provided.";
            form.reset();
            form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
            phoneField?.setCustomValidity("");

            if (enquiryType) {
                enquiryType.dispatchEvent(new Event("change"));
            }
        } catch (error) {
            // Keep entered values after a failure so the visitor can retry, and distinguish
            // a network problem from a message returned by the server.
            status.className = "form-status form-status--error";
            status.textContent = error instanceof TypeError
                ? "We could not reach the message service. Please check your connection and try again."
                : error.message;
        } finally {
            // Always restore the submit control, whether the request succeeded or failed.
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});
