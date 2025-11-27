## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
Here’s a detailed prompt you can use to guide an AI (like ChatGPT or similar) to structure a business logic documentation based on content extracted from a prototype codebase organized in a module structure:

\---

\#\#\# \*\*Prompt for AI:\*\*  
"You are an expert technical writer and business analyst. Your task is to create a structured and comprehensive business logic documentation based on content extracted from a prototype codebase. The codebase is organized in a \*\*module structure\*\*, and each module contains relevant business rules, data definitions, and logic implementations. Follow the structure below to organize the documentation:

\---

\#\#\# \*\*1. Introduction\*\*  
   \- \*\*Purpose\*\*: Explain the purpose of the documentation and its relevance to the prototype codebase.  
   \- \*\*Scope\*\*: Define the scope of the documentation, focusing on the modules in the codebase.  
   \- \*\*Audience\*\*: Identify the intended audience (e.g., developers, testers, business stakeholders).  
   \- \*\*Version History\*\*: Include a version control table with dates, authors, and changes made.

\---

\#\#\# \*\*2. Business Context\*\*  
   \- \*\*Business Objectives\*\*: Summarize the high-level business goals supported by the codebase.  
   \- \*\*Module Overview\*\*: Provide a high-level description of each module and its role in the business process.  
   \- \*\*Key Stakeholders\*\*: List the stakeholders involved in defining or using the business logic.

\---

\#\#\# \*\*3. Business Rules (Per Module)\*\*  
   \- \*\*Module Name\*\*: Start with the name of the module.  
   \- \*\*Rule ID\*\*: Assign a unique identifier to each rule.  
   \- \*\*Rule Description\*\*: Extract and describe the business rules implemented in the module.  
   \- \*\*Conditions\*\*: Specify the conditions under which the rule applies (e.g., "If X, then Y").  
   \- \*\*Actions\*\*: Define the actions or outcomes triggered by the rule.  
   \- \*\*Exceptions\*\*: Document any exceptions or edge cases.  
   \- \*\*Source\*\*: Reference the source of the rule (e.g., regulatory requirements, business policies).

\---

\#\#\# \*\*4. Data Definitions (Per Module)\*\*  
   \- \*\*Module Name\*\*: Start with the name of the module.  
   \- \*\*Data Entities\*\*: List the key data entities used in the module.  
   \- \*\*Attributes\*\*: Define the attributes of each entity (e.g., data type, format, constraints).  
   \- \*\*Relationships\*\*: Describe relationships between entities (e.g., one-to-many, many-to-many).  
   \- \*\*Data Flow\*\*: Provide a diagram or description of how data flows within the module.

\---

\#\#\# \*\*5. Logic Implementation (Per Module)\*\*  
   \- \*\*Module Name\*\*: Start with the name of the module.  
   \- \*\*Technical Details\*\*: Extract and document the logic implementation (e.g., pseudocode, formulas, algorithms).  
   \- \*\*Dependencies\*\*: List any dependencies (e.g., external systems, APIs, databases).  
   \- \*\*Configuration Settings\*\*: Document any configurable parameters or settings.

\---

\#\#\# \*\*6. Validation and Testing (Per Module)\*\*  
   \- \*\*Module Name\*\*: Start with the name of the module.  
   \- \*\*Test Scenarios\*\*: Define test cases to validate the business logic.  
   \- \*\*Expected Outcomes\*\*: Specify the expected results for each test scenario.  
   \- \*\*Error Handling\*\*: Document how errors or exceptions should be handled.  
   \- \*\*Approval Process\*\*: Describe the process for approving and signing off on the logic.

\---

\#\#\# \*\*7. Maintenance and Governance\*\*  
   \- \*\*Ownership\*\*: Identify the owner(s) responsible for maintaining the business logic.  
   \- \*\*Review Process\*\*: Outline the process for reviewing and updating the logic.  
   \- \*\*Change Management\*\*: Document how changes to the logic will be managed and communicated.  
   \- \*\*Compliance\*\*: Ensure the logic adheres to relevant regulations or standards.

\---

\#\#\# \*\*8. Appendices\*\*  
   \- \*\*Glossary\*\*: Define any technical or business terms used in the document.  
   \- \*\*References\*\*: Include links to related documents, standards, or resources.  
   \- \*\*Diagrams/Flowcharts\*\*: Attach any additional diagrams or flowcharts for clarity.

\---

\#\#\# \*\*9. Approval and Sign-off\*\*  
   \- \*\*Approval Table\*\*: Include a table for stakeholders to sign off on the documented business logic.  
   \- \*\*Date\*\*: Capture the date of approval.  
   \- \*\*Comments\*\*: Allow space for any additional comments or notes.

\---

\*\*Instructions for the AI:\*\*  
1\. Analyze the prototype codebase and extract relevant content for each module.  
2\. Organize the extracted content into the structure provided above.  
3\. Use clear and concise language to describe the business logic, ensuring it is understandable for both technical and non-technical stakeholders.  
4\. If specific details are missing from the codebase, note them as "To be defined" or "Requires further clarification."  
5\. Ensure the documentation is modular, scalable, and easy to update as the codebase evolves.  
6\. The document will be stored in the /docs directory of the project.

\---

This prompt will guide the AI to create a well-structured and detailed business logic documentation tailored to your prototype codebase. Let me know if you need further adjustments\!  
