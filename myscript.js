const aboutPage = document.querySelector(".about-page");

if (aboutPage) {
    aboutPage.classList.add("js-enabled");

    const revealItems = aboutPage.querySelectorAll(".reveal");
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

        tabsContainer.hidden = false;
        activateTab(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);

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
        if (window.L) {
            const map = window.L.map(mapElement, {
                scrollWheelZoom: false
            }).setView([-27.8, 29.3], 4);

            const tileLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

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

                window.L.marker(location.coordinates)
                    .addTo(map)
                    .bindPopup(popup);
            });

            mapStatus.textContent = "Interactive map loaded. Select a marker for more information.";
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

        const showImage = (index) => {
            currentImageIndex = (index + galleryItems.length) % galleryItems.length;
            const selectedItem = galleryItems[currentImageIndex];
            lightboxImage.src = selectedItem.dataset.galleryImage;
            lightboxImage.alt = selectedItem.querySelector("img").alt;
            lightboxCaption.textContent = selectedItem.dataset.galleryCaption;
        };

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