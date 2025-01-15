**I. Core Feature: Recipe Management**

This encompasses all functionalities related to creating, viewing, editing, and managing individual recipes, including preparation instructions and associated media.

**II. Functional Requirements (Categorized by Feature Area)**

**A. Recipe Creation & Editing:**

*   **FR_REC_001: Create New Recipe:**
    *   The system shall allow users to create a new recipe record.
    *   The creation process shall involve inputting details such as:
        *   Recipe Code (unique identifier, potentially auto-generated)
        *   Description (primary name)
        *   Other Description (alternative name)
        *   Category
        *   Location
        *   Unit of Sale
        *   Number of Portions (previously Portion Size)
        *   Preparation Time
        *   Total Time
        *   Preparation Notes (general notes about the recipe)
        *   Image (upload and display for the main recipe)
    *   The system shall provide a clear and intuitive form for data entry.
    *   The system shall validate required fields before allowing saving.
*   **FR_REC_002: Edit Existing Recipe:**
    *   The system shall allow users to modify existing recipe records.
    *   Users shall be able to access the edit functionality through an "Edit" button or similar action.
    *   All recipe details shall be editable, including general information and preparation steps.
    *   The system shall track changes made to the recipe (audit log - implicit requirement).
*   **FR_REC_003: View Recipe Details:**
    *   The system shall display comprehensive details of a selected recipe.
    *   The display shall include all the information fields mentioned in FR_REC_001, along with calculated costs, ingredient details, and preparation steps with associated media.
    *   The system shall display the main recipe image.
*   **FR_REC_004: Void Recipe:**
    *   The system shall allow users to mark a recipe as void or inactive.
    *   Voiding a recipe should not delete it from the system to preserve historical data.
    *   Voided recipes should be clearly identifiable (e.g., different status indicator).
    *   The system should prevent voided recipes from being used in active processes (e.g., sales).
*   **FR_REC_005: Print Recipe:**
    *   The system shall provide a functionality to print the details of a recipe in a readable format.
    *   The printed output should include essential information like recipe name, ingredients, quantities, preparation steps, and potentially associated media URLs or thumbnails.

**B. Ingredient Management:**

*   **FR_ING_001: Add Ingredients to Recipe:**
    *   The system shall allow users to add ingredients to a recipe.
    *   The process should involve selecting an item (Product or Recipe) and specifying:
        *   Quantity
        *   Unit (Unit used in the recipe)
        *   Inventory Unit of Measurement (Unit in which the ingredient is stored/purchased)
        *   Cost/Unit (Cost per Inventory Unit of Measurement)
        *   Wastage (%)
    *   The system shall automatically calculate:
        *   Wastage Cost
        *   Net Cost
        *   Total Cost for the ingredient.
    *   The system may need to perform unit conversion if the "Unit" and "Inventory Unit of Measurement" are different.
*   **FR_ING_002: Edit Ingredient Details:**
    *   The system shall allow users to modify the details of an ingredient within a recipe, including:
        *   Quantity
        *   Unit
        *   Inventory Unit of Measurement
        *   Cost/Unit
        *   Wastage (%)
    *   Changes to quantity, unit, inventory unit of measurement, or cost should trigger recalculation of related costs. Changes to units might require recalculation of quantity if conversions are involved.
*   **FR_ING_003: Delete Ingredient:**
    *   The system shall allow users to remove ingredients from a recipe.
    *   Deleting an ingredient should trigger recalculation of the recipe's total cost and related financial metrics.
*   **FR_ING_004:  Categorize Ingredient Type:**
    *   The system shall allow for the categorization of ingredients (e.g., Product, Recipe, Spice).

**C. Preparation Steps Management:**

*   **FR_PREP_001: Add Preparation Step:**
    *   The system shall allow users to add individual preparation steps to a recipe.
    *   Each step should include:
        *   Step Number (automatically generated or manually assignable for ordering)
        *   Description (textual instructions for the step)
*   **FR_PREP_002: Edit Preparation Step:**
    *   The system shall allow users to modify the details of an existing preparation step, including the step number and description.
*   **FR_PREP_003: Delete Preparation Step:**
    *   The system shall allow users to remove a preparation step from a recipe.
    *   Deleting a step should automatically re-order subsequent steps if step numbers are sequential.
*   **FR_PREP_004: Reorder Preparation Steps:**
    *   The system shall allow users to change the order of preparation steps (e.g., drag-and-drop or using up/down buttons).
*   **FR_PREP_005: Attach Media to Preparation Step:**
    *   The system shall allow users to attach media files (images or videos) to individual preparation steps.
    *   Users should be able to upload media files from their local devices.
    *   The system should support common image (e.g., JPG, PNG) and video (e.g., MP4) formats.
*   **FR_PREP_006: View Media Attachments:**
    *   The system shall display the attached media (images and videos) for each preparation step.
    *   Images should be displayed inline or as thumbnails that can be expanded.
    *   Videos should be playable within the interface or provide a link to play them.
*   **FR_PREP_007: Delete Media Attachment:**
    *   The system shall allow users to remove media attachments from a preparation step.

**D. Cost Calculation & Management:**

*   **FR_COST_001: Calculate Ingredient Costs:**
    *   The system shall calculate the cost of each ingredient based on:
        *   Quantity
        *   Unit (used in the recipe)
        *   Inventory Unit of Measurement
        *   Cost/Unit (cost per Inventory Unit of Measurement)
        *   Wastage (%)
    *   The system needs to handle unit conversion to ensure accurate cost calculation if the recipe unit differs from the inventory unit.
    *   `Wastage Cost = (Quantity in Inventory Unit * Cost/Unit) * Wastage (%)`
    *   `Net Cost = (Quantity in Inventory Unit * Cost/Unit) - Wastage Cost`
    *   `Total Cost (per ingredient) = Net Cost` (assuming no additional cost factors at ingredient level)
*   **FR_COST_002: Calculate Total Recipe Cost:**
    *   The system shall calculate the total cost of the recipe by summing the total costs of all its ingredients.
*   **FR_COST_003: Calculate Cost of Portion:**
    *   The system shall calculate the cost of a single portion based on the total recipe cost and the number of portions.
    *   `Cost of Portion = Total Cost / Number of Portions`
*   **FR_COST_004: Calculate Total Mix Percentage:**
    *   The system shall calculate the percentage of the total cost represented by the "Total Mix."
    *   `Total Mix Percentage = (Total Mix / Total Cost) * 100`
*   **FR_COST_005: Calculate Cost of Total Mix:**
    *   The system shall calculate the "Cost of Total Mix" using the provided formula.
    *   `Cost of Total Mix = (Total Cost * 100 + Total Mix) / 100`
*   **FR_COST_006: Calculate Net Price Percentage (and Recalculation Logic):**
    *   The system shall calculate the "Net Cost Percentage" based on the "Cost of Total Mix" and "Net Price."
    *   `Net Cost Percentage = (Cost of Total Mix * 100) / Net Price`
    *   If the user overrides the "Net Cost Percentage," the system shall recalculate the "Net Price."
    *   `Net Price = (Cost of Total Mix * 100) / Net Cost Percentage`
*   **FR_COST_007: Calculate Gross Price Percentage (and Recalculation Logic):**
    *   The system shall calculate the "Gross Cost Percentage" based on the "Cost of Total Mix" and "Gross Price."
    *   `Gross Cost Percentage = (Cost of Total Mix * 100) / Gross Price`
    *   If the user overrides the "Gross Cost Percentage," the system shall recalculate the "Gross Price."
    *   `Gross Price = (Cost of Total Mix * 100) / Gross Cost Percentage`
*   **FR_COST_008: Apply Service Charge:**
    *   The system shall allow for the input of a "Service Charge."
    *   The service charge may be a fixed amount or a percentage.
    *   The system should have a default service charge setting that can be overridden.
*   **FR_COST_009: Apply Tax Rate:**
    *   The system shall allow for the input of a "Tax Rate."
    *   The tax rate is usually a percentage.
    *   The system should have a default tax rate setting that can be overridden.
*   **FR_COST_010: Update Cost Function:**
    *   The system shall provide a dedicated function ("Update Cost" button) to recalibrate all cost calculations.
    *   This function should re-evaluate ingredient costs based on potential changes in ingredient prices, wastage, or quantities.
    *   It should also recalculate all derived financial metrics (Cost of Portion, Net Price, Gross Price, etc.).

**E. User Interface (UI) and User Experience (UX):**

*   **FR_UI_001: Display Action Buttons:**
    *   The system shall display action buttons for "Update Cost," "Create," "Edit," "Void," "Print," and "Back."
*   **FR_UI_002: Display Function Buttons:**
    *   The system shall provide buttons or areas for "Image Box" (displaying the main recipe image) and "Image" (uploading/viewing the main recipe image).
*   **FR_UI_003: Display Recipe Information:**
    *   The system shall clearly display all recipe information fields as described in FR_REC_001.
*   **FR_UI_004: Display Side Panel Information:**
    *   The system shall display the "Status," "Preparation," "Preparation Time," and "Total Time" in a side panel or designated area.
*   **FR_UI_005: Display Total Cost and Financial Metrics:**
    *   The system shall clearly display the "Total Cost" and all related financial metrics (Total Mix Percentage, Cost of Total Mix, Net Price, Gross Price, Net Cost Percentage, Gross Cost Percentage, Service Charge, Tax Rate).
*   **FR_UI_006: Display Ingredients Table:**
    *   The system shall present the ingredients in a tabular format with columns for Type, Item, Description, Quantity, Unit, Inventory Unit of Measurement, Cost/Unit, Wastage (%), Net Cost, Wastage Cost, and Total Cost.
*   **FR_UI_007: Provide Ingredient Actions:**
    *   The ingredients table shall provide options to "Edit" or "Delete" individual ingredients.
*   **FR_UI_008: Provide Action Buttons for Ingredients (Edit/Delete, Save & New, Save, Cancel):**
    *   The system shall provide these buttons for managing ingredients during the creation/editing process.
*   **FR_UI_009: Image Display:**
    *   The system shall display the uploaded main recipe image clearly.
*   **FR_UI_010: Display Preparation Steps:**
    *   The system shall display the preparation steps in a clear, ordered format, likely with step numbers.
*   **FR_UI_011: Edit/Add Preparation Steps Interface:**
    *   The system shall provide an interface for adding, editing, deleting, and reordering preparation steps. This could involve a list view with editing capabilities or a dedicated section within the recipe creation/editing form.
*   **FR_UI_012: Display Media Attachments for Steps:**
    *   The system shall display the attached media (images and videos) for each preparation step, potentially as thumbnails or inline previews.
*   **FR_UI_013: Manage Media Attachments Interface:**
    *   The system shall provide an interface for uploading, viewing, and deleting media attachments for each preparation step.

**F. System Functionality:**

*   **FR_SYS_001: Auto-Running Functions (Note):** The system shall have auto-running functions, the specifics of which need further clarification.
*   **FR_SYS_002: Default Settings (Note):** The system shall have default settings for "Service Charge" and "Tax Rate," with the ability to override these settings at the recipe level.
*   **FR_SYS_003: Unit Conversion Logic:** The system shall implement logic for converting between different units of measurement for ingredients. This might involve a lookup table or a dedicated conversion service.

**III. Non-Functional Requirements (Examples - further definition needed)**

*   **Performance:** The system should respond quickly to user actions and calculations, including loading media files.
*   **Security:** Access to recipe information, editing functionalities, and media uploads should be controlled based on user roles and permissions.
*   **Usability:** The system should be intuitive and easy to use for kitchen staff and administrators, including the process of adding and managing preparation steps and media.
*   **Maintainability:** The system should be designed in a way that allows for easy updates and modifications, including the media management components.
*   **Scalability:** The system should be able to handle a growing number of recipes, users, and media files.

**IV. Open Questions and Areas for Clarification:**

*   **Definition of "Total Mix":** The document mentions "Total Mix" and "Cost of Total Mix" but doesn't explicitly define what "Total Mix" represents. This needs clarification.
*   **Details of "Auto-running function":** The note "Note Add Auto running function" requires further specification on what functions run automatically and under what conditions.
*   **User Roles and Permissions:** The document doesn't explicitly mention user roles, but a recipe management system likely needs different access levels for viewing, creating, and editing recipes.
*   **Media Storage:** How will media attachments be stored (e.g., local file system, cloud storage)?
*   **Media File Size Limits:** Are there any limitations on the size of media files that can be uploaded?
*   **Wastage Calculation (Clarification):** Is the "Wastage (%)" applied to the quantity measured in the recipe's unit or the inventory unit?

This updated outline provides a more comprehensive view of the system's requirements, including the crucial additions of preparation steps and media attachment management. Addressing the open questions and further defining the non-functional requirements will be essential for successful development.
