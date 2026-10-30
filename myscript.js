const aboutPage = document.querySelector(".about-page");

// Keep this page-specific behavior from affecting the site's other pages.
if (aboutPage) {
    aboutPage.classList.add("js-enabled");

    const revealItems = aboutPage.querySelectorAll(".reveal");
    // Animate sections only as they enter the viewport, and show them all if unsupported.
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

        // Keep the selected tab, visible panel, and keyboard focus in sync.
        const activateTab = (selectedTab, moveFocus = false) => {
            tabs.forEach((tab) => {
                const isSelected = tab === selectedTab;
                tab.setAttribute("aria-selected", String(isSelected));
                tab.tabIndex = isSelected ? 0 : -1;
            });

            panels.forEach((panel) => {
                panel.hidden = panel.id !== selectedTab.getAttribute("aria-controls");
            });

            if (moveFocus) {
                selectedTab.focus();
            }
        };

        // Enable the controls only after their behavior is ready; the HTML fallback stays readable otherwise.
        tabsContainer.hidden = false;
        activateTab(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);

        // Support both mouse clicks and keyboard navigation for accessible tabs.
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

            // These coordinates are illustrative regional references, not confirmed project sites.
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

                // Build popup content with text nodes rather than inserting HTML from data.
                window.L.marker(location.coordinates)
                    .addTo(map)
                    .bindPopup(popup);
            });

            mapStatus.textContent = "Interactive map loaded. Select a marker for more information.";
            // Reports missing map tiles separately from a missing map library.
            tileLayer.on("tileerror", () => {
                mapStatus.textContent = "Map tiles could not be loaded. The countries served are South Africa, Mozambique and Lesotho.";
            });
        } else {
            mapStatus.textContent = "Interactive map unavailable. The countries served are South Africa, Mozambique and Lesotho.";
        }
    }

    const gallery = aboutPage.querySelector("[data-gallery]");
    const lightbox = aboutPage.querySelector(".lightbox");
    if (gallery && lightbox && typeof lightbox.showModal === "function") {
        const galleryItems = Array.from(gallery.querySelectorAll("[data-gallery-image]"));
        const lightboxImage = lightbox.querySelector(".lightbox-image");
        const lightboxCaption = lightbox.querySelector(".lightbox-caption");
        const closeButton = lightbox.querySelector(".lightbox-close");
        let currentImageIndex = 0;

        // One helper updates the image, its accessible description and its caption together.
        // Wrap around at each end so previous/next navigation always has an image to show.
        const showImage = (index) => {
            currentImageIndex = (index + galleryItems.length) % galleryItems.length;
            const selectedItem = galleryItems[currentImageIndex];
            lightboxImage.src = selectedItem.dataset.galleryImage;
            lightboxImage.alt = selectedItem.querySelector("img").alt;
            lightboxCaption.textContent = selectedItem.dataset.galleryCaption;
        };

        // A single listener handles every gallery button, including clicks on its image or caption.
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
        // Closes only when the dimmed backdrop is clicked, not when the photo itself is clicked.
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                lightbox.close();
            }
        });
        lightbox.addEventListener("keydown", (event) => {
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

if (programsGrid && programControls && programResults) {
    // Keep the program data separate from the page markup so results can be filtered and rebuilt.
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
        const searchTerm = searchInput.value.trim().toLocaleLowerCase();
        const selectedCategory = categorySelect.value;
        const sortOrder = sortSelect.value;

        const matchingPrograms = programs
            .filter((program) => {
                const matchesSearch = `${program.title} ${program.description}`
                    .toLocaleLowerCase()
                    .includes(searchTerm);
                const matchesCategory = selectedCategory === "all" || program.category === selectedCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((first, second) => {
                const nameOrder = first.title.localeCompare(second.title);
                return sortOrder === "za" ? -nameOrder : nameOrder;
            });

        // Build cards with DOM text nodes so program text is never treated as HTML.
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

        // Replace the previous results together so sorting and filtering stay in sync.
        programsGrid.replaceChildren(...cards);

        if (matchingPrograms.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "program-empty";
            emptyMessage.textContent = "No programs match your search. Try another word or choose a different focus area.";
            programsGrid.append(emptyMessage);
        }

        const countLabel = matchingPrograms.length === 1 ? "program" : "programs";
        programResults.textContent = `Showing ${matchingPrograms.length} ${countLabel}.`;
    };

    // Keep the original cards available until the controls and renderer are ready.
    programControls.hidden = false;
    renderPrograms();
    programControls.addEventListener("submit", (event) => event.preventDefault());
    searchInput.addEventListener("input", renderPrograms);
    categorySelect.addEventListener("change", renderPrograms);
    sortSelect.addEventListener("change", renderPrograms);
}

const ajaxForms = document.querySelectorAll("[data-ajax-form]");

// Check phone numbers by counting digits, while allowing familiar punctuation.
const validatePhoneField = (phoneField) => {
    const digits = phoneField.value.replace(/\D/g, "");
    const isOptionalAndEmpty = !phoneField.required && phoneField.value.trim() === "";
    const usesAllowedCharacters = /^[+0-9(). -]+$/.test(phoneField.value);
    const isValid = isOptionalAndEmpty
        || (usesAllowedCharacters && digits.length >= 7 && digits.length <= 15);

    phoneField.setCustomValidity(isValid ? "" : "Enter a phone number using only digits and common phone punctuation, with 7 to 15 digits.");
    phoneField.setAttribute("aria-invalid", String(!isValid));
    return isValid;
};

ajaxForms.forEach((form) => {
    const phoneField = form.querySelector('input[type="tel"]');
    const enquiryType = form.querySelector("[data-enquiry-type]");
    const response = form.querySelector("[data-enquiry-response]");
    const status = form.querySelector("[data-email-status]");
    const submitButton = form.querySelector('button[type="submit"]');

    if (phoneField) {
        phoneField.addEventListener("input", () => validatePhoneField(phoneField));
        phoneField.addEventListener("blur", () => validatePhoneField(phoneField));
    }

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

    form.addEventListener("invalid", (event) => {
        event.target.setAttribute("aria-invalid", "true");
        status.className = "form-status form-status--error";
        status.textContent = event.target.validationMessage || "Please correct this field before sending.";
    }, true);

    if (enquiryType && response) {
        const today = new Date();
        const localToday = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");
        const volunteerDate = form.querySelector("#volunteer-date");
        volunteerDate.min = localToday;

        const enquiryResponses = {
            program: "We can share details about the program you choose. The site does not list a fixed cost or live capacity, so the team will confirm current arrangements.",
            volunteer: "Volunteer roles and start dates depend on current needs. The team can confirm which opportunities are available.",
            sponsor: "Sponsorship options and amounts depend on the proposed support and current priorities. The team can discuss suitable options with you.",
            general: "Tell us what you would like to know and the team can point you in the right direction."
        };

        // Show only the questions for the chosen topic and require its relevant selection.
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
        updateEnquiryFields();
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (phoneField && !validatePhoneField(phoneField)) {
            status.className = "form-status form-status--error";
            status.textContent = "Please enter a valid phone number before sending.";
            phoneField.reportValidity();
            return;
        }

        if (!form.reportValidity()) {
            const firstInvalidField = form.querySelector(":invalid");
            firstInvalidField?.setAttribute("aria-invalid", "true");
            firstInvalidField?.focus();
            return;
        }

        const originalButtonText = submitButton.textContent;
        const formData = Object.fromEntries(new FormData(form).entries());
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        status.className = "form-status";
        status.textContent = "Sending your message securely...";

        try {
            // Send form data in the background so the visitor stays on this page.
            const result = await fetch(form.action, {
                method: form.method.toUpperCase(),
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const reply = await result.json().catch(() => ({}));

            if (!result.ok) {
                throw new Error(reply.message || "We could not send your message. Please try again later.");
            }

            status.className = "form-status form-status--success";
            status.textContent = reply.message || "Your message has been sent. The team will reply using the email address you provided.";
            form.reset();
            form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
            phoneField?.setCustomValidity("");

            if (enquiryType) {
                enquiryType.dispatchEvent(new Event("change"));
            }
        } catch (error) {
            status.className = "form-status form-status--error";
            status.textContent = error instanceof TypeError
                ? "We could not reach the message service. Please check your connection and try again."
                : error.message;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});
