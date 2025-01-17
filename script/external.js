// ==UserScript==
// @name         Tick m3u checkboxes (external list)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  ..
// @match        https://m3u4u.com/playlisteditor*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    const baseUrl = 'https://raw.githubusercontent.com/sapphicshawol/Playlists/main/';
    const categories = [
        'True Crime',
        'Paranormal',
        'Home & Lifestyle',
        'Documentaries',
        'Food',
        'History',
        'Discovery',
        'Entertainment',
        'Reality',
        'Game Shows',
        'Movies',
        'Music',
        'Cars & Sports',
        'Test'
    ];

    function getCategoryUrl(category) {
        return baseUrl + category.toLowerCase().replace(/ /g, '-').replace(/&/g, '').replace(/-+/g, '-') + '.txt';
    }

    const categoryUrls = categories.reduce((acc, category) => {
        acc[category] = getCategoryUrl(category);
        return acc;
    }, {});

    function removeSuffixes(text) {
        const suffixes = [
            ' ------ Aus',
            ' ------ Pluto CA',
            ' ------ Pluto GB',
            ' ------ Pluto US',
            ' ------ Roku',
            ' ------ Samsung CA',
            ' ------ Samsung GB',
            ' ------ Samsung US',
            ' ------ Plex AU',
            ' ------ Plex CA',
            ' ------ Plex NZ',
            ' ------ Plex US'
        ];
        for (const suffix of suffixes) {
            if (text.endsWith(suffix)) {
                return text.substring(0, text.length - suffix.length).trim();
            }
        }
        return text;
    }

    function normalizeText(text) {
        return text.toLowerCase().replace(/ *\([^)]*\) */g, '').trim();
    }

    function tickCheckboxes(category, itemsToSelect) {
        const options = document.querySelectorAll('mat-list-option');
        options.forEach(option => {
            let text = option.querySelector('.mat-list-text').innerText.trim();
            text = removeSuffixes(text);
            const normalizedText = normalizeText(text);
            if (itemsToSelect.some(item => normalizeText(removeSuffixes(item)) === normalizedText)) {
                option.click();
            }
        });
    }

    function fetchAndTickCheckboxes(category) {
        const githubUrl = categoryUrls[category];
        if (githubUrl) {
            GM_xmlhttpRequest({
                method: "GET",
                url: githubUrl,
                onload: function(response) {
                    if (response.status === 200) {
                        const itemsToSelect = response.responseText.split('\n').map(item => item.trim()).filter(item => item.length > 0);
                        tickCheckboxes(category, itemsToSelect);
                    } else {
                        alert('Error fetching content from GitHub: ' + response.status);
                    }
                }
            });
        } else {
            alert('Category not found.');
        }
    }

    window.onload = function() {
        const dropdown = document.createElement('select');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.text = category;
            dropdown.appendChild(option);
        });

        dropdown.style.position = 'fixed';
        dropdown.style.bottom = '10px';
        dropdown.style.right = '150px';
        dropdown.style.padding = '5px';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.borderRadius = '5px';
        dropdown.style.zIndex = '1000000000000000000000';

        const button = document.createElement('div');
        button.innerHTML = 'Tick Checkboxes';
        button.style.position = 'fixed';
        button.style.bottom = '10px';
        button.style.right = '10px';
        button.style.padding = '7px';
        button.style.backgroundColor = '#91b4d8';
        button.style.color = 'white';
        button.style.fontSize ='14px';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000000000000000000000';
        button.addEventListener('click', function() {
            const selectedCategory = dropdown.value;
            fetchAndTickCheckboxes(selectedCategory);
        });

        document.body.appendChild(dropdown);
        document.body.appendChild(button);
    };
})();
