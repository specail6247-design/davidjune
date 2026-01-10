
# Lotto Number Generator

## Overview

This project is a web application that generates and displays random lottery numbers. It features a modern, interactive design and allows users to either generate a full set of numbers randomly or pre-select some of their own.

## Features

*   **Random Number Generation:** Generates a set of 6 unique random numbers between 1 and 45.
*   **User Number Selection:** Allows users to pick their own numbers from a grid.
*   **Hybrid Generation:** If a user pre-selects numbers, the app will randomly generate the remaining numbers to complete the set of 6.
*   **Web Components:** Uses a custom `<lotto-ball>` element for a polished display of numbers.
*   **Modern Design:** A clean, responsive layout with animations, sound effects, and an engaging user interface.

## Current Plan: Version Up!

*   **`index.html`:**
    *   Add a container for the user number selection grid.
    *   Add a 'Clear' button alongside the 'Generate' button.
*   **`style.css`:**
    *   Style the number selection grid, including states for selected numbers.
    *   Style the new 'Clear' button.
    *   Adjust the layout to accommodate the new elements.
*   **`main.js`:**
    *   Dynamically generate the 1-45 number grid.
    *   Implement logic for selecting/deselecting numbers.
    *   Update the 'Generate' button logic to incorporate user-selected numbers.
    *   Add functionality to the 'Clear' button to reset the application state.
