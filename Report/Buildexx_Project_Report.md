<a name="x8bfb5f277ea975b20b54c902123caf8ec0b4fab"></a>    **A** 

**Project Report on** 

**Buildex**

(**Verified New Schema & Smart Rental Management System**) 
**\


**BTech IT, Sem VI** 



Prepared By: 



**Visodiya Dhyey** (IT-147)** 

**Vaghasiya Jenil** (IT-145)** 



` `Guided By: 

**Prof. Viral H. Shah**

Dept. of Information Technology 







![](Aspose.Words.1425271b-e60d-44f0-bb24-f799daef4625.001.jpeg)




## **Department of Information Technology** 
**Faculty of Technology,**  

**Dharmsinh Desai University** 

**College Road, Nadiad - 387001** 
**\


`		`**March 2026** 
### **CANDIDATE’S DECLARATION** 
### **  


We hereby certify that the work which is being presented in the project report entitled **“Buildexx: Comprehensive Real Estate Management System”** in partial fulfillment of the requirements for the award of the degree of **Bachelor of Technology** in **Information Technology** submitted to **[Dharmsinh Desai University]** is an authentic record of our own work carried out during a period from **[December, 2025]** to **[February, 2026]** under the supervision of **Prof. [Prof. Viral H. Shah]**, Department of Information Technology.

The matter presented in this report has not been submitted by us for the award of any other degree of this or any other Institute.











Candidate’s Signature 

Candidate’s Name: Visodiya Dhyey (IT147) 

Student ID: 23ITUOZ145













Candidate’s Signature 

Candidate’s Name: Vaghasiya Jenil (IT145) 

Student ID: 23ITUBS130



**Date:** …………………………
## **DHARMSINH DESAI UNIVERSITY** 
**NADIAD-387001, GUJARAT** 



![](Aspose.Words.1425271b-e60d-44f0-bb24-f799daef4625.002.png) 



![](Aspose.Words.1425271b-e60d-44f0-bb24-f799daef4625.003.png) 






## **CERTIFICATE** 
** 

This is to certify that the project carried out in the subject of Project-I, entitled “Cloudiverse” and recorded in this report is a bonafide report of the work of 



1) Visodiya Dhyey Roll No. IT147  ID No: 23ITUOZ145
1) Vaghasiya Jenil Roll No. IT145  ID No: 23ITUBS130



of Department of Information Technology, semester VI. They were involved in project work during academic year 2025–2026. 







Prof.  Viral H. Shah

(Project Guide), 

Department of Information Technology, 

Faculty of Technology, 

Dharmsinh Desai University, Nadiad Date:  







Prof. (Dr.) V. K. Dabhi 

Head , Department of Information Technology, 

Faculty of Technology,  

Dharmsinh Desai University, Nadiad Date:  

<a name="candidates-declaration"></a>**External Examiner 1:** ………………………… **External Examiner 2:** …………………………

<a name="certificate"></a><a name="acknowledgement"></a>**ACKNOWLEDGEMENT** 





We extend our heartfelt gratitude to the **Department of Information Technology, Dharmsinh Desai University**, for providing us with the necessary resources, support, and an encouraging environment to undertake our project journey. 



We sincerely thank our project guide, **Prof. Viral H. Shah**, for his unwavering support, insightful feedback, and invaluable guidance throughout the development of our project, “**Buildex**”. His mentorship played a crucial role in shaping our understanding and successfully bringing this project to fruition. 



We also express our deep appreciation to our Head of Department, **Prof. (Dr.) V. K. Dabhi**, for fostering a culture of innovation and continuous learning, and for his constant encouragement and support. 



Lastly, we are grateful to all the faculty members and staff of the Information Technology Department for their guidance, as well as to our peers and classmates, whose feedback and motivation were instrumental throughout this journey. 





Visodiya Dhyey (IT145) 





Vaghasiya Jenil (IT145) 





B. Tech Semester VI  

Department of Information Technology  

Dharmsinh Desai University  







## <a name="abstract"></a>**ABSTRACT**
The Real Estate industry is one of the most globally recognized sectors, essentially comprising four sub-sectors - housing, retail, hospitality, and commercial. In recent times, the industry has seen a paradigm shift towards digitalization. However, many existing solutions still suffer from data fragmentation, lack of transparency, and reliance on manual processes for critical tasks like rent payments and enquiry management.

**Buildexx** is a full-stack web application designed to address these challenges by providing a unified platform for Builders, Buyers, and Tenants. The system is engineered to streamline the entire property lifecycle—from listing and discovery to enquiry management and secure financial transactions.

The project utilizes a robust technology stack comprising **React.js** for a dynamic and responsive frontend, **Java Spring Boot** for a scalable and secure backend, and **PostgreSQL** for reliable relational data storage. Key features of Buildexx include:

1. **Role-Based Access Control (RBAC):** Distinct dashboards and functionalities for Builders, Admin, and Regular Users (Buyers/Tenants).
1. **Advanced Property Management:** Builders can list properties with comprehensive details including amenities, location data, and high-resolution imagery.
1. **Intelligent Search:** A powerful search engine allowing users to filter properties based on city, budget, property type, and furnishing status.
1. **Integrated Payment Gateway:** Integration with **Razorpay** to facilitate secure, traceable, and instant rent payments, generating automated digital receipts.
1. **Enquiry Tracking System:** A centralized hub for builders to view and manage customer interests, replacing chaotic email threads.

This report details the complete software development lifecycle of Buildexx, encompassing the feasibility study, system analysis, architectural design, implementation details, testing strategies, and future scope. The resulting platform demonstrates a significant improvement in operational efficiency and user experience compared to traditional manual real estate management methods.







## <a name="table-of-contents"></a>**TABLE OF CONTENTS**
**1. INTRODUCTION** 

[1.1 Overview	](#_1.1_overview)									9	

[1.2 Problem Statement](#_1.2_problem_statement) 								9

[1.3 Project Objectives](#_1.3_project_objectives) 								9

[1.4 Scope of the Project	](#_1.4_scope_of)							10

[1.5 System Features at a Glance](#_1.5_system_features)							10

**2. PROJECT MANAGEMENT** 

[2.1 Development Methodology (Agile SCRUM) 		](#_2.1_development_methodology)			11

[2.2 Feasibility Study](#_2.2_feasibility_study) 									11

[2.2.1 Technical Feasibility](#_2.2.1_technical_feasibility) 

[2.2.2 Operational Feasibility](#_2.2.2_operational_feasibility) 

[2.2.3 Economic Feasibility](#_2.2.3_economic_feasibility) 

[2.3 Project Planning & Scheduling](#_2.3_project_planning) 

[2.4 Team Composition & Roles](#_2.4_team_composition) 

[2.5 Tools and Technologies Used](#_2.5_tools_and)

**3. SYSTEM REQUIREMENTS SPECIFICATION (SRS)** 

[3.1 User Characteristics](#_3.1_user_characteristics) 

[3.2 Functional Requirements](#_3.2_functional_requirements) 

3\.2.1 Authentication Module 

3\.2.2 Property Management Module 

3\.2.3 Search & Discovery Module 

3\.2.4 Payment Module 

3\.2.5 User Dashboard Module 

3\.3 Non-Functional Requirements 

3\.4 System Constraints 

3\.5 Assumptions and Dependencies

**4. SYSTEM ANALYSIS AND DESIGN** 

4\.1 System Architecture 

4\.2 Unified Modeling Language (UML) Diagrams 

4\.2.1 Use Case Diagram 

4\.2.2 Class Diagram 

4\.2.3 Sequence Diagrams 

4\.2.4 Activity Diagrams 

4\.2.5 Entity-Relationship (ER) Diagram 

4\.3 Database Design (Schema Documentation) 

4\.4 Data Flow Diagrams (DFD)

**5. IMPLEMENTATION DETAILS** 

5\.1 Folder Structure 

5\.2 Backend Implementation (Spring Boot) 

5\.3 Frontend Implementation (React.js) 

5\.4 Key Algorithms and Logic 

5\.5 API Documentation 

5\.6 Third-Party Integrations (Razorpay, Google Maps)

**6. TESTING AND VALIDATION** 

6\.1 Testing Methodology 

6\.2 Test Plan 

6\.3 Test Cases 

6\.3.1 Unit Testing 

6\.3.2 Integration Testing 

6\.3.3 System Testing 

6\.4 Bug Tracking and Resolution

**7. SCREENSHOTS AND USER MANUAL** 

[7.1 Home Page](#_7.1_home_page) 

[7.2 User Authentication](#_7.2_user_authentication) 

[7.3 Builder Dashboard](#_7.3_builder_dashboard) 

[7.4 Property Listing](#_7.4_property_listing)

[ 7.5 Payment Flow](#_7.5_payment_flow)

**8. CONCLUSION AND FUTURE SCOPE** 

[8.1 Conclusion](#_8.1_conclusion) 

[8.2 Limitations](#_8.2_limitations) 

[8.3 Future Enhancements](#_8.3_future_enhancements)

[**9. REFERENCES**](#_chapter_9:_references)


**LIST OF FIGURES**

Figure 1.1 – Buildexx System Overview Diagram

Figure 2.1 – Agile SCRUM Sprint Workflow

Figure 2.2 – Project Gantt Chart / Timeline

Figure 3.1 – Use Case Diagram: User Module

Figure 3.2 – Use Case Diagram: Builder Module

Figure 3.3 – Use Case Diagram: Admin Module

Figure 4.1 – Three-Tier System Architecture Diagram

Figure 4.2 – Entity Relationship (ER) Diagram

Figure 4.3 – Data Flow Diagram (DFD) Level 0 – Context Diagram

Figure 4.4 – Data Flow Diagram (DFD) Level 1 – System Processes

Figure 4.5 – Class Diagram (Backend Entities)

Figure 4.6 – Sequence Diagram: User Login Flow

Figure 4.7 – Sequence Diagram: Razorpay Payment Flow

Figure 5.1 – Spring Boot Application Layer Architecture

Figure 5.2 – React.js Component Hierarchy

Figure 5.3 – JWT Authentication Filter Chain Flow

Figure 6.1 – Test Environment Setup Diagram

Figure 7.1 – Screenshot: Home Page and Property Listing

Figure 7.2 – Screenshot: Builder Dashboard

Figure 7.3 – Screenshot: Property Detail Page with Google Map

Figure 7.4 – Screenshot: Razorpay Payment Modal

Figure 7.5 – Screenshot: PDF Receipt Download Page

-----
**LIST OF TABLES**

Table 2.1 – Frontend Technology Stack

Table 2.2 – Backend Application Technology Stack

Table 2.3 – DevOps and Development Tools

Table 2.4 – Team Composition and Roles

Table 3.1 – User Roles and System Permissions

Table 3.2 – Functional Requirements Traceability Matrix

Table 3.3 – Non-Functional Requirements (Quality Attributes)

Table 3.4 – Hardware Specifications

Table 3.5 – Software Specifications

Table 4.1 – Data Dictionary: users Table

Table 4.2 – Data Dictionary: properties Table

Table 4.3 – Data Dictionary: enquiries Table

Table 4.4 – Data Dictionary: payments Table

Table 5.1 – REST API Endpoint Complete Specification

Table 6.1 – Backend Service Layer Unit Tests

Table 6.2 – End-to-End System Flow Validations

Table A.1 – Full Database Schema for All Core Tables

Table B.1 – Spring Boot Maven Backend Dependencies

Table B.2 – React.js NPM Frontend Dependencies
# <a name="chapter-1-introduction"></a>**CHAPTER 1: INTRODUCTION**
### <a name="_1.1_overview"></a><a name="overview"></a>**1.1 Overview**
The real estate market is expanding rapidly, with an increasing number of properties being developed and leased daily. However, the management of these properties, specifically regarding verified listings and secure rental payments, remains largely fragmented. **Buildexx** is conceptualized as a “One-Stop Solution” for digital real estate management. It is a web-based application that brings Builders and generic Users (Buyers/Tenants) onto a single platform.

Unlike aggregator sites that often suffer from outdated data and fake listings, Buildexx emphasizes a **Builder-Centric Model**. By allowing builders to manage their portfolios directly, the platform ensures that the data presented to the end-user is accurate, up-to-date, and verified. Furthermore, Buildexx integrates financial technology to handle rent collection, a feature often missing in standard listing sites.

### <a name="_1.2_problem_statement"></a><a name="problem-statement"></a>**1.2 Problem Statement**
Despite the proliferation of property sites, several core issues persist: 

1\. **Unverified Listings:** Many platforms are flooded with duplicate or fake listings posted by unauthorized brokers. 

2\. **Payment Friction:** Rent payments involved offline cash/cheque transactions, leading to lack of digital trails and manual receipt generation. 

3\. **Communication Gaps:** Enquiries sent via portals often end up in spam folders or are missed by builders, leading to lost leads. 

4\. **Scattered Tools:** Builders use one tool for CRM, another for accounting, and a third for listings.

### <a name="_1.3_project_objectives"></a><a name="project-objectives"></a>**1.3 Project Objectives**
The primary goal of Buildexx is to democratize real estate management technology. \* **Centralization:** To integrate property listing, searching, and renting into a unified workflow. \* **Automation:** To automate the generation of rent receipts and payment tracking. \* **Verification:** To ensure only authorized builders can list properties, reducing fraud. \* **Usability:** To provide a modern, responsive user interface that works seamlessly across devices.


### <a name="_1.4_scope_of"></a><a name="scope-of-the-project"></a>**1.4 Scope of the Project**
- **Geographical Scope:** Currently designed for the Indian market (handling INR currency, localized address formats), but capable of global expansion.
- **Target Audience:**
  - **Builders/Developers:** Small to mid-sized real estate firms looking for a digital presence.
  - **Tenants:** Individuals looking for rental properties with secure payment options.
  - **Buyers:** Investment seekers looking for verified property data.

### <a name="_1.5_system_features"></a><a name="system-features-at-a-glance"></a>**1.5 System Features at a Glance**
- **Secure Authentication:** JWT (JSON Web Token) based stateless authentication.
- **Dynamic Search:** Real-time filtering of properties.
- **Payments:** Razorpay integration for credit card, debit card, and UPI transactions.
- **Dashboards:** Analytics-rich dashboards for builders to track portfolio performance.
- **Multimedia Support:** High-quality image carousels for property showcases.

#
#
#
#
#


# <a name="chapter-2-project-management"></a>**CHAPTER 2: PROJECT MANAGEMENT**

### <a name="_2.1_development_methodology"></a><a name="development-methodology"></a>**2.1 Development Methodology**
We adopted the **Agile SCRUM** methodology for the development of Buildexx. This iterative approach allowed us to: 1. **Adapt to Changes:** Requirements were refined as we better understood the user needs during development. 2. **Continuous Delivery:** We delivered functional modules in 2-week sprints (e.g., Auth module, then Property module, then Payment). 3. **Immediate Feedback:** Testing was integrated into every sprint, ensuring bugs were caught early.

### <a name="_2.2_feasibility_study"></a><a name="feasibility-study"></a>**2.2 Feasibility Study**
#### <a name="_2.2.1_technical_feasibility"></a><a name="technical-feasibility"></a>*2.2.1 Technical Feasibility*
The project is highly technically feasible. \* **Java Spring Boot:** A mature, enterprise-grade framework ensuring robustness and scalability. \* **React.js:** The industry standard for single-page applications (SPAs), delivering a smooth user experience. \* **PostgreSQL:** An open-source, ACID-compliant relational database capable of handling complex join operations required for property-user mappings. \* **Docker (Optional):** The microservices-ready architecture allows for easy containerization.

#### <a name="_2.2.2_operational_feasibility"></a><a name="operational-feasibility"></a>*2.2.2 Operational Feasibility*
The system is designed with a “User-First” approach. \* **No Training Required:** The UI mimics standard e-commerce and listing platforms, ensuring users intuitively know how to search and pay. \* **Builder Onboarding:** A simple verification process makes it easy for builders to join and start listing immediately.

#### <a name="_2.2.3_economic_feasibility"></a><a name="economic-feasibility"></a>*2.2.3 Economic Feasibility*
Buildexx is cost-effective. \* **Development Costs:** Utilizes open-source stacks (Java, React, Postgres), eliminating licensing fees. \* **Infrastructure:** Can be hosted on budget-friendly cloud providers (Render, AWS Free Tier). \* **ROI:** For builders, the reduction in administrative overhead (manual receipts, lead tracking) translates to direct cost savings.
###

### <a name="x89381935900585382387d95f0b4d702fd86a5bc"></a><a name="_2.3_project_planning"></a>**2.3 Project Planning & Scheduling (Gantt Chart Description)**
- **Week 1-2:** Requirement Analysis & System Design (ER Diagrams, API Contracts).
- **Week 3-4:** Infrastructure Setup (Database, Spring Boot Init, CI/CD).
- **Week 5-6:** Backend Development (Auth, User Services).
- **Week 7-8:** Backend Development (Property, Search Services).
- **Week 9-10:** Frontend Development (UI Components, State Management).
- **Week 11:** Payment Gateway Integration.
- **Week 12:** Integration Testing & Bug Fixes.
- **Week 13:** Documentation & Final Report Generation.
### <a name="_2.4_team_composition"></a><a name="team-composition-roles"></a>**2.4 Team Composition & Roles**
- **Visodiya Dhyey:** **Backend Lead.** Responsible for database schema design, API development in Spring Boot, Security configuration, and Payment integration.
- **Vaghasiya Jenil: Frontend Lead.** Responsible for UI/UX design in Figma, Component implementation in React, State management, and API consumption.

### <a name="_2.5_tools_and"></a><a name="tools-and-technologies-used"></a>**2.5 Tools and Technologies Used**
- **Runtime:** Java 17, Node.js v18.
- **Frameworks:** Spring Boot 3.0, React 18, Tailwind CSS.
- **Database:** PostgreSQL 14.
- **IDE:** IntelliJ IDEA (Backend), VS Code (Frontend).
- **Version Control:** Git & GitHub.
- **API Testing:** Postman.
- **Design:** Figma.











# <a name="x3ec6b9e9a2753d63d260b6ef1eccdd517e142f9"></a>**CHAPTER 3: SYSTEM REQUIREMENTS SPECIFICATION (SRS)**

### <a name="_3.1_user_characteristics"></a><a name="user-characteristics"></a>**3.1 User Characteristics**
1. **Admin:** Super-user with access to all data. Can ban users or verify builders.
1. **Builder:** A verified entity allowed to post listings. Tech-savviness is assumed to be moderate.
1. **User:** The general public. Tech-savviness varies; UI must be extremely simple.

### <a name="_3.2_functional_requirements"></a><a name="functional-requirements"></a>**3.2 Functional Requirements**
#### <a name="authentication-module"></a>*3.2.1 Authentication Module*
- **FR\_01:** The system shall allow users to register as either “User” or “Builder”.
- **FR\_02:** The system shall hash passwords using **BCrypt** before storage.
- **FR\_03:** The system shall issue a **JWT** upon successful login, valid for 24 hours.
- **FR\_04:** The system shall protect all API routes (except Public Search) requiring a valid JWT.

#### <a name="property-management-module"></a>*3.2.2 Property Management Module*
- **FR\_05:** Builders shall be able to Create, Read, Update, and Delete (CRUD) their own property listings.
- **FR\_06:** Property details must include Title, Price/Rent, Area, Configuration (BHK), City, Locality, and Amenities.
- **FR\_07:** The system shall support uploading up to 5 images per property.
- **FR\_08:** The system shall validate inputs (e.g., Price cannot be negative).

#### <a name="search-discovery-module"></a>*3.2.3 Search & Discovery Module*
- **FR\_09:** Users shall be able to search properties by City (Case-insensitive).
- **FR\_10:** Users shall be able to filter by “Purpose” (Buy vs Rent).
- **FR\_11:** The search results shall display a summary card for each property.
- **FR\_12:** Clicking a card shall navigate to the detailed view.

#### <a name="payment-module"></a>*3.2.4 Payment Module*
- **FR\_13:** The system shall integrate with Razorpay Order API to initiate a transaction.
- **FR\_14:** The system shall verify the payment signature (HMAC SHA256) returned by the client.
- **FR\_15:** On success, a payment record shall be inserted into the database linked to the User and Property.
- **FR\_16:** The system shall allow users to download a PDF receipt of the payment.

#### <a name="user-dashboard-module"></a>*3.2.5 User Dashboard Module*
- **FR\_17:** Users shall view a history of all payments made.
- **FR\_18:** Users shall view a list of enquiries they have sent.
- **FR\_19:** Users shall be able to update their profile details (Phone, Address).
### <a name="non-functional-requirements"></a>**3.3 Non-Functional Requirements**
1. **Performance:** API response time should be under 200ms for 95% of requests.
1. **Scalability:** The backend should be stateless to allow horizontal scaling.
1. **Availability:** The system should target 99.9% uptime.
1. **Security:** All data in transit must be encrypted via TLS (HTTPS). Sensitive data (Passwords) must be encrypted at rest.
1. **Maintainability:** Code should follow standard MVC patterns and be well-commented.

### <a name="system-constraints"></a>**3.4 System Constraints**
- **Browser Support:** Only modern browsers (Chrome 90+, Firefox 88+, Safari 14+) are supported.
- **Network:** The payment feature requires an active internet connection; no offline mode for transactions.
- **Currency:** Restricted to INR (Indian Rupee) for the initial release.

### <a name="assumptions-and-dependencies"></a>**3.5 Assumptions and Dependencies**
- It is assumed that the **Razorpay API** services are available and operational.
- It is assumed that the **PostgreSQL** database is backed up daily.
- Dependency on **Google Maps API** for location services (requires valid API key).

#

#
#

# <a name="chapter-4-system-analysis-and-design"></a>**CHAPTER 4: SYSTEM ANALYSIS AND DESIGN**
### <a name="system-architecture"></a>**4.1 System Architecture**
Buildexx follows a classic **Three-Tier Architecture**: 

1\. **Client Tier (Frontend):** React.js application running in the user’s browser. Responsible for rendering UI and managing local state. 

2\. **Application Tier (Backend):** Spring Boot application running on the server (Tomcat). Responsible for business logic, validation, and security. 

3\. **Data Tier (Database):** PostgreSQL server. Responsible for persistent storage of relational data.

**Interaction Flow:** Client (JSON) <–> REST API Controllers <–> Service Layer <–> JPA Repositories <–> Database.

<a name="unified-modeling-language-uml-diagrams"></a>
### **4.2 Unified Modeling Language (UML) Diagram<a name="use-case-diagram"></a>s**
### ***4.2.1 Use Case Diagram***
![](Aspose.Words.1425271b-e60d-44f0-bb24-f799daef4625.004.png)
#### ![](Aspose.Words.1425271b-e60d-44f0-bb24-f799daef4625.005.png)<a name="class-diagram"></a>*4.2.2 Class Diagram*
####
####
####
<a name="sequence-diagram-rent-payment"></a>
#### *4.2.3 Sequence Diagram (Buy and Sell)*
![](Aspose.Words.1425271b-e60d-44f0-bb24-f799daef4625.006.png)	**1. Buy Sequence Diagram**

![](Aspose.Words.1425271b-e60d-44f0-bb24-f799daef4625.007.png)	**2. Sell Sequence Diagram**

###
### <a name="database-design-schema-documentation"></a>**4.3 Database Design (Schema Documentation)**
### <a name="data-flow-diagrams-dfd"></a>**Table: users**

|<h3>**Column**</h3>|<h3>**Type**</h3>|<h3>**Constraints**</h3>|<h3>**Description**</h3>|
| :- | :- | :- | :- |
|<h3>**id**</h3>|<h3>**BIGSERIAL**</h3>|<h3>**PRIMARY KEY**</h3>|<h3>**Unique ID**</h3>|
|<h3>**email**</h3>|<h3>**VARCHAR**</h3>|<h3>**UNIQUE, NOT NULL**</h3>|<h3>**Login Email**</h3>|
|<h3>**password**</h3>|<h3>**VARCHAR**</h3>|<h3>**NOT NULL**</h3>|<h3>**BCrypt Hash**</h3>|
|<h3>**role**</h3>|<h3>**VARCHAR**</h3>|<h3>**NOT NULL**</h3>|<h3>**BUILDER, USER, ADMIN**</h3>|
|<h3>**full\_name**</h3>|<h3>**VARCHAR**</h3>|<h3></h3>|<h3>**Display Name**</h3>|
### -----
### **Table: properties**

|<h3>**Column**</h3>|<h3>**Type**</h3>|<h3>**Constraints**</h3>|<h3>**Description**</h3>|
| :- | :- | :- | :- |
|<h3>**id**</h3>|<h3>**BIGSERIAL**</h3>|<h3>**PRIMARY KEY**</h3>|<h3>**Unique ID**</h3>|
|<h3>**title**</h3>|<h3>**VARCHAR**</h3>|<h3>**NOT NULL**</h3>|<h3>**Property Title**</h3>|
|<h3>**description**</h3>|<h3>**TEXT**</h3>|<h3></h3>|<h3>**Details / Marketing Copy**</h3>|
|<h3>**price**</h3>|<h3>**DECIMAL**</h3>|<h3></h3>|<h3>**Selling Price (for Buy/Sell)**</h3>|
|<h3>**rent\_amount**</h3>|<h3>**DECIMAL**</h3>|<h3></h3>|<h3>**Monthly Rent (for Rent)**</h3>|
|<h3>**builder\_id**</h3>|<h3>**BIGINT**</h3>|<h3>**FK -> users(id)**</h3>|<h3>**Property Owner/Builder**</h3>|
|<h3>**city**</h3>|<h3>**VARCHAR**</h3>|<h3>**INDEXED**</h3>|<h3>**Searchable Location**</h3>|
### -----
###
###
###
###
###
### **Table: enquiries**

|<h3>**Column**</h3>|<h3>**Type**</h3>|<h3>**Constraints**</h3>|<h3>**Description**</h3>|
| :- | :- | :- | :- |
|<h3>**id**</h3>|<h3>**BIGSERIAL**</h3>|<h3>**PRIMARY KEY**</h3>|<h3>**Unique ID**</h3>|
|<h3>**message**</h3>|<h3>**TEXT**</h3>|<h3></h3>|<h3>**Enquiry content from user**</h3>|
|<h3>**user\_id**</h3>|<h3>**BIGINT**</h3>|<h3>**FK -> users(id)**</h3>|<h3>**Sender of the enquiry**</h3>|
|<h3>**property\_id**</h3>|<h3>**BIGINT**</h3>|<h3>**FK -> properties(id)**</h3>|<h3>**Targeted property**</h3>|
|<h3>**status**</h3>|<h3>**VARCHAR**</h3>|<h3>**DEFAULT 'PENDING'**</h3>|<h3>**PENDING, RESPONDED, CLOSED**</h3>|
### -----
### **Table: payments**

|<h3>**Column**</h3>|<h3>**Type**</h3>|<h3>**Constraints**</h3>|<h3>**Description**</h3>|
| :- | :- | :- | :- |
|<h3>**id**</h3>|<h3>**BIGSERIAL**</h3>|<h3>**PRIMARY KEY**</h3>|<h3>**Unique ID**</h3>|
|<h3>**order\_id**</h3>|<h3>**VARCHAR**</h3>|<h3></h3>|<h3>**Razorpay Order ID**</h3>|
|<h3>**payment\_id**</h3>|<h3>**VARCHAR**</h3>|<h3></h3>|<h3>**Razorpay Payment ID**</h3>|
|<h3>**amount**</h3>|<h3>**DECIMAL**</h3>|<h3>**NOT NULL**</h3>|<h3>**Total Amount Paid**</h3>|
|<h3>**status**</h3>|<h3>**VARCHAR**</h3>|<h3></h3>|<h3>**SUCCESS, FAILED, PENDING**</h3>|
### **4.4 Data Flow Diagrams (DFD)**
**Level 0 DFD:** \* External Entities: User, Builder. \* Process: Buildexx System. \* Data Flow: User inputs credentials -> System validates -> System returns Token.

**Level 1 DFD (Property Management):** \* Builder -> [Upload Property Info] -> Validate Data -> [Save to DB]. \* User -> [Search Query] -> Filter Logic -> [Fetch from DB] -> Display Results.

-----
# <a name="chapter-5-implementation-details"></a>**CHAPTER 5: IMPLEMENTATION DETAILS**
### <a name="folder-structure"></a>**5.1 Folder Structure**
The project follows a standard Maven (Backend) and NPM (Frontend) structure.
#### <a name="backend-structure-spring-boot"></a>*Backend Structure (Spring Boot)*
src/main/java/com/buildex\
├── config             # Security & Application Config\
│   ├── SecurityConfig.java\
│   └── CorsConfig.java\
├── controller         # REST API Endpoints\
│   ├── AuthController.java\
│   ├── PropertyController.java\
│   └── PaymentController.java\
├── dto                # Data Transfer Objects\
│   ├── LoginRequest.java\
│   └── PropertyDTO.java\
├── entity             # JPA Entities (Database Tables)\
│   ├── User.java\
│   ├── Property.java\
│   └── Payment.java\
├── repository         # Data Access Layer\
│   ├── UserRepository.java\
│   └── PropertyRepository.java\
├── service            # Business Logic\
│   ├── AuthService.java\
│   ├── PropertyService.java\
│   └── RazorpayService.java\
└── utils              # Helper Classes\
`    `└── JwtUtils.java
#### <a name="frontend-structure-react.js"></a>*Frontend Structure (React.js)*
src/\
├── api                # API Service Calls (Axios)\
│   └── apiService.js\
├── assets             # Static Assets (Images, Icons)\
├── components         # Reusable UI Components\
│   ├── Navbar.jsx\
│   ├── Footer.jsx\
│   ├── PropertyCard.jsx\
│   └── PaymentModal.jsx\
├── context            # Global State (Auth Context)\
│   └── AuthContext.jsx\
├── pages              # Route Pages\
│   ├── Home.jsx\
│   ├── Login.jsx\
│   ├── BuilderDashboard.jsx\
│   └── UserDashboard.jsx\
├── styles             # Global CSS\
└── App.jsx            # Main Entry Point
### <a name="backend-implementation-spring-boot"></a>**5.2 Backend Implementation (Spring Boot)**
#### <a name="authentication-service-authservice.java"></a>*5.2.1 Authentication Service (AuthService.java)*
This service handles user registration and login. It uses BCryptPasswordEncoder to hash passwords and JwtUtils to generate tokens.

@Service\
**public** **class** AuthService {\
\
`    `@Autowired\
`    `**private** UserRepository userRepository;\
\
`    `@Autowired\
`    `**private** PasswordEncoder passwordEncoder;\
\
`    `@Autowired\
`    `**private** JwtUtils jwtUtils;\
\
`    `**public** String login(LoginRequest request) {\
`        `User user = userRepository.findByEmail(request.getEmail())\
.orElseThrow(() -> **new** RuntimeException("User not found"));\
\
`        `**if** (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {\
`            `**throw** **new** RuntimeException("Invalid credentials");\
`        `}\
\
`        `**return** jwtUtils.generateToken(user.getEmail(), user.getRole());\
`    `}\
}
#### <a name="x8c67c1dfdba3170bd0fa1476acd733e2239a4d1"></a>*5.2.2 Property Controller (PropertyController.java)*
This controller exposes endpoints for creating and fetching properties.

@RestController\
@RequestMapping("/api/properties")\
**public** **class** PropertyController {\
\
`    `@Autowired\
`    `**private** PropertyService propertyService;\
\
`    `@GetMapping\
`    `**public** List<Property> getAllProperties() {\
`        `**return** propertyService.findAll();\
`    `}\
\
`    `@PostMapping\
`    `@PreAuthorize("hasRole('BUILDER')")\
`    `**public** Property createProperty(@RequestBody PropertyDTO dto) {\
`        `**return** propertyService.create(dto);\
`    `}\
}
### <a name="frontend-implementation-react.js"></a>**5.3 Frontend Implementation (React.js)**
#### <a name="api-service-apiservice.js"></a>*5.3.1 API Service (apiService.js)*
A centralized Axios instance is used to make HTTP requests, automatically attaching the JWT token to headers.

**import** axios **from** 'axios';\
\
**const** apiClient = axios.create({\
`    `baseURL: 'http://localhost:8080/api',\
});\
\
apiClient.interceptors.request.use((config) **=>** {\
`    `**const** token = localStorage.getItem('token');\
`    `**if** (token) {\
`        `config.headers.Authorization = `Bearer ${token}`;\
`    `}\
`    `**return** config;\
});\
\
**export** **const** fetchProperties = () **=>** apiClient.get('/properties');\
**export** **const** createProperty = (data) **=>** apiClient.post('/properties', data);
#### <a name="property-card-component-propertycard.jsx"></a>*5.3.2 Property Card Component (PropertyCard.jsx)*
A reusable component to display property details in a grid.

**const** PropertyCard = ({ property }) **=>** {\
`    `**return** (\
`        `**<div** className="card"**>**\
`            `**<img** src={property.imageUrl} alt={property.title} **/>**\
`            `**<div** className="card-body"**>**\
`                `**<h3>**{property.title}**</h3>**\
`                `**<p>**Price: ₹{property.price}**</p>**\
`                `**<p>**Location: {property.city}**</p>**\
`                `<Link to={`/property/${property.id}`}>View Details</Link>\
`            `**</div>**\
`        `**</div>**\
`    `);\
};
### <a name="key-algorithms-and-logic"></a>**5.4 Key Algorithms and Logic**
#### <a name="jwt-authentication-flow"></a>*5.4.1 JWT Authentication Flow*
1. **Login:** User sends credentials. Server validates and signs a JWT with a secret key.
1. **Storage:** Client stores JWT in localStorage.
1. **Access:** For every subsequent request, the JWT is sent in the Authorization header.
1. **Verification:** A Spring Security filter intercepts the request, parses the JWT, and sets the Authentication context if valid.
#### <a name="razorpay-payment-verification"></a>*5.4.2 Razorpay Payment Verification*
To ensure security, payments are verified on the server-side using the HMAC SHA256 algorithm. generated\_signature = hmac\_sha256(order\_id + "|" + payment\_id, secret) If generated\_signature matches razorpay\_signature sent by the frontend, the payment is authentic.
### <a name="api-documentation"></a>**5.5 API Documentation**

|Method|Endpoint|Description|Auth Required|
| :- | :- | :- | :- |
|POST|/api/auth/register|Register new user|No|
|POST|/api/auth/login|Login user|No|
|GET|/api/properties|Get all properties|No|
|POST|/api/properties|Create property|Yes (Builder)|
|GET|/api/users/me|Get current user profile|Yes|
|POST|/api/payments/create-order|Create Razorpay Order|Yes|
|POST|/api/payments/verify|Verify Payment|Yes|








# <a name="chapter-6-testing-and-validation"></a>**CHAPTER 6: TESTING AND VALIDATION**
### <a name="testing-methodology"></a>**6.1 Testing Methodology**
Testing is a critical phase to ensure the system is bug-free and meets the specified requirements. We employed a combination of **Manual Testing** and **Automated Testing**. \* **Unit Testing:** Handled by developers during the coding phase (using JUnit for Java). \* **System Testing:** Performed on the integrated system to verify end-to-end flows.
### <a name="test-plan"></a>**6.2 Test Plan**
- **Test Environment:** Windows 10/11, Chrome Browser, Localhost Server.
- **Test Tools:** Postman (API), Chrome DevTools (UI).
- **Scope:** All functional modules (Auth, Property, Payment).
### <a name="test-cases"></a>**6.3 Test Cases**
#### <a name="unit-testing-sample"></a>*6.3.1 Unit Testing (Sample)*

|Test Case ID|Unit|Description|Input|Expected Output|Actual Output|Status|
| :- | :- | :- | :- | :- | :- | :- |
|UT\_01|AuthService|Validate Email Format|test@test|Invalid Email|Invalid Email|PASS|
|UT\_02|PropertyService|Create Property|price: -100|Exception (Negative Price)|Exception Thrown|PASS|
#### <a name="integration-testing-system-flows"></a>*6.3.2 Integration Testing (System Flows)*
**Test Case 1: User Registration** 

**Objective:** Verify a new user can register. 

**Steps:** 1. Navigate to /register. 2. Enter Name, Email, Password. 3. Click Register. 

**Expected Result:** Success message displayed; redirected to Login. 

**Actual Result:** User record created in Database; Redirected. 

**Status:** **PASS**

**Test Case 2: Builder Property Posting** 

**Objective:** Verify a builder can post a new property. 

**Precondition:** Logged in as Builder. 

**Steps:** 1. Go to Dashboard -> Add Property. 2. Fill form 3. Submit. 

**Expected Result:** Property appears in “My Listings”. 

**Actual Result:** Property saved to DB; UI updates. 

**Status:** **PASS**

**Test Case 3: Rent Payment** 

**Objective:** Verify rent payment flow. 

**Precondition:** Logged in as User; Property selected. 

**Steps:** 1. Click “Pay Rent”. 2. Razorpay modal opens. 3. Enter Test Card details. 4. Submit. 

**Expected Result:** Payment Successful; Receipt Generated. 

**Actual Result:** DB updated with Payment Record; PDF downloaded. 

**Status:** **PASS**

#### <a name="system-testing"></a>*6.3.3 System Testing*
System testing was conducted on the complete, integrated application to evaluate the system's compliance with its specified requirements. This phase focused on end-to-end scenarios, performance, and security.

**1. Functional End-to-End Testing**
- **Objective:** To ensure that all modules work together seamlessly.
- **Scenario:** A new builder registers, posts a property with multiple images and amenities. A new user registers, searches for the property, views details, and completes a rent payment via Razorpay.
- **Observation:** All data points correctly flowed from the frontend forms to the PostgreSQL database. The payment signature was successfully verified on the backend, and a PDF receipt was generated correctly.
- **Status:** **PASS**

**2. Performance & Load Testing**
- **Objective:** To verify system responsiveness under concurrent usage.
- **Scenario:** Simulated 50 concurrent users performing search and filter operations using Postman collection runner.
- **Result:** Average API response time remained under 150ms. No database connection leak or memory spikes were observed in the JVM.
- **Status:** **PASS**

**3. Security Testing**
- **Objective:** To ensure data integrity and unauthorized access prevention.
- **Tests Conducted:**
    - Attempting to access `/api/properties` (POST) without a JWT: **Result: 403 Forbidden**.
    - Attempting to modify another builder's property: **Result: Access Denied** (Handled via Service logic).
    - Cross-Site Scripting (XSS) input in property descriptions: **Result: Sanitized**.
- **Status:** **PASS**

**4. Browser Compatibility Testing**
- **Tested Browsers:** Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari (Mobile).
- **Outcome:** The layout remained responsive across all tested browsers. Tailwind CSS utility classes ensured consistent rendering of the dashboard and cards.
- **Status:** **PASS**

### <a name="bug-tracking-and-resolution"></a>**6.4 Bug Tracking and Resolution**
During testing, several bugs were identified and fixed: 

1. **Bug:** CORS Error when calling Backend from Frontend logic. 

**Fix:** Added @CrossOrigin annotation to Controllers and configured CorsConfig bean. 

1. **Bug:** Images not loading on Property Card. 

   **Fix:** Corrected the image path mapping in PropertyDTO.

1. **Bug:** Payment Receipt showing incorrect date. 

**Fix:** Updated PdfService to use LocalDateTime.now() instead of Date().



# <a name="chapter-7-user-manual"></a>**CHAPTER 7: USER MANUAL**
### <a name="_7.1_home_page"></a><a name="home-page"></a>**7.1 Home Page**
The Home Page is the landing point for all users. \* **Navigation Bar:** Provides links to Login, Register, Buy, Rent. \* **Hero Section:** Features a search bar to quickly find properties. \* **Featured Listings:** Displays top-rated properties in a grid view.
### <a name="_7.2_user_authentication"></a><a name="user-authentication"></a>**7.2 User Authentication**
- **Register:** Users must sign up using a valid email. Builders must check the “I am a Builder” box.
- **Login:** Secure login using email and password.
### <a name="_7.3_builder_dashboard"></a><a name="builder-dashboard"></a>**7.3 Builder Dashboard**
Upon logging in, Builders are greeted with their dashboard. \* **Add Property Button:** Opens a modal to input property details. \* **My Listings:** A table view of all properties posted by the builder. Actions include Edit and Delete. \* **Enquiries Tab:** Displays a list of users interested in the properties.
### <a name="_7.4_property_listing"></a><a name="property-listing-detailed-view"></a>**7.4 Property Listing (Detailed View)**
Clicking on any property card on the Home Page opens the Detailed View. \* **Image Gallery:** A carousel of property images. \* **Details:** Price, Area, Configuration, Address. \* **Map:** Google Map embedding showing the location. \* **Action Buttons:** “Request Info” (sends enquiry) or “Pay Rent” (opens payment gateway).
### <a name="_7.5_payment_flow"></a><a name="payment-flow"></a>**7.5 Payment Flow**
1. User clicks “Pay Rent”.
1. A secure modal opens (Razorpay).
1. User selects payment method (Card/UPI).
1. Upon success, a “Download Receipt” button appears.
1. Transaction is recorded in the “Payment History” section of the User Dashboard.
-----
<a name="chapter-8-conclusion-and-future-scope"></a>
# **CHAPTER 8: CONCLUSION AND FUTURE SCOPE**
### <a name="_8.1_conclusion"></a><a name="conclusion"></a>**8.1 Conclusion**
The **Buildexx** project has successfully achieved its primary objective of developing a centralized, efficient, and user-friendly Real Estate Management System. By leveraging modern web technologies like Spring Boot and React, we have created a scalable platform that solves real-world problems faced by builders and tenants.

The system automates critical tasks such as rent collection and enquiry management, reducing manual effort and error. The integration of a secure payment gateway adds significant value, making financial transactions transparent and traceable. The responsive design ensures that the platform is accessible to a wide audience using various devices.
### <a name="_8.2_limitations"></a><a name="limitations"></a>**8.2 Limitations**
Despite its robust features, the current version has some limitations: 1. **No Live Chat:** Communication is asynchronous (via Enquiry forms); real-time chat is missing. 2. **Static Maps:** The map integration is basic; it does not support advanced geo-fencing or “search nearby” features based on current GPS location. 3. **Limited Admin Controls:** The Admin panel is basic, focusing mainly on verification.
### <a name="_8.3_future_enhancements"></a><a name="future-enhancements"></a>**8.3 Future Enhancements**
To evolve Buildexx into a commercial-grade product, the following features are proposed: 

1\. **Virtual Reality (VR) Tours:** Integration with 360-degree cameras to allow users to virtually walk through properties. 

2\. **AI-Based Price Prediction:** Using Machine Learning algorithms to suggest property prices based on historical data and market trends. 

3\. **Real-Time Chat:** Implementing WebSockets (Socket.io) for instant messaging between Builders and Users.

` `4. **Mobile Application:** Developing a React Native mobile app for iOS and Android. 

5\. **Multi-Language Support:** Adding i18n support to cater to non-English speaking users in rural areas.

-----
<a name="chapter-9-references"></a>
# <a name="_chapter_9:_references"></a>**CHAPTER 9: APPENDIX**
‘

**APPENDIX A: Database Schema Description**

The Buildexx platform uses a PostgreSQL relational database made up of nine core tables.

The **users** table stores account information for every registered person. It holds their unique email, a BCrypt-hashed password, their role (USER, BUILDER, or ADMIN), full name, optional phone number, and account creation date.

The **properties** table is the central table of the platform. It stores all real estate listing details: title, description, sale price, rent amount, area in square feet, BHK configuration, city, locality, purpose (BUY or RENT), current status, and the ID of the builder who posted it.

The **property\_images** table stores the image URLs linked to each property. When a property is deleted, all its images are automatically deleted too.

The **property\_amenities** table stores yes/no flags for each property's facilities: parking, gym, swimming pool, lift, power backup, and furnished status.

The **enquiries** table stores messages sent by users to builders about a property. It records the message, which user sent it, which property it is about, the status (PENDING, VIEWED, CONTACTED, or RESOLVED), and the date sent.

The **rent\_requests** table records formal rental applications by users. It links a user to a property and tracks the request status (PENDING, APPROVED, or REJECTED).

The **payments** table is the financial ledger. It records every payment: the Razorpay order ID, the payment ID after success, amount paid, currency (INR), payment status (INITIATED, SUCCESS, DROPPED, or REFUNDED), and timestamps.

The **withdrawals** table lets builders request payout of collected earnings. It stores bank account number, IFSC code, withdrawal amount, and request status.

The **complaints** table lets users raise issues against a builder or property. It stores the complaint description, admin resolution note, and status (OPEN, IN REVIEW, or RESOLVED).

-----
**APPENDIX B: Project Dependencies**

**Backend (Spring Boot / Maven)**

spring-boot-starter-web sets up the embedded Tomcat server and REST API layer. spring-boot-starter-security provides JWT-based authentication and role-based access control. spring-boot-starter-data-jpa provides Hibernate ORM and Spring Data repository support. spring-boot-starter-validation enables input validation using annotations like @NotNull and @Email. postgresql is the JDBC driver for connecting to the PostgreSQL database. jjwt-api and jjwt-impl handle JWT token creation and verification. razorpay-java is the official Razorpay SDK for creating payment orders. itext7-core is used to generate downloadable PDF payment receipts. lombok auto-generates getters, setters, and constructors to reduce boilerplate code.

**Frontend (React / NPM)**

react and react-dom are the core libraries for building the user interface. react-router-dom handles client-side navigation between pages without full page reloads. axios is the HTTP client used for all API requests, with an interceptor that attaches the JWT token automatically. tailwindcss is the CSS framework used for all styling. vite is the fast development server and build tool. bootstrap-icons provides the icon library used across the UI. react-hot-toast shows success and error notifications to the user.

-----
**APPENDIX C: Glossary**

**API** – A set of rules that lets different software systems talk to each other over HTTP.

**RBAC (Role-Based Access Control)** – A security model where access rights depend on the user's role (USER, BUILDER, or ADMIN).

**JWT (JSON Web Token)** – A signed token issued on login that proves a user's identity in every subsequent request.

**SPA (Single-Page Application)** – A web app that loads once and updates content dynamically without reloading the page.

**JPA (Java Persistence API)** – A standard Java way to map Java objects to database tables.

**ORM (Object-Relational Mapping)** – Automatically converts between Java objects and database rows. Buildexx uses Hibernate as the ORM.

**HMAC** – A cryptographic method to verify a message has not been tampered with. Used to verify Razorpay payment signatures.

**CORS (Cross-Origin Resource Sharing)** – A browser rule that controls which external domains can call an API.

**DTO (Data Transfer Object)** – A simple object used to pass data between layers of the application without exposing database internals.

**CRUD** – The four basic database operations: Create, Read, Update, Delete.

**ACID** – Database properties guaranteeing reliable transactions: Atomicity, Consistency, Isolation, Durability.

**MVC (Model-View-Controller)** – An architecture pattern separating data, UI, and logic into three distinct layers.

**BCrypt** – A secure, slow password hashing algorithm that makes brute-force attacks impractical.

**TLS/HTTPS** – The encryption protocol that secures all data between the browser and server.

**INR** – Indian National Rupee. The currency used in all Buildexx transactions.


# **CHAPTER 10: REFERENCES**
1. **Spring Boot Documentation:** https://spring.io/projects/spring-boot - *Used for Backend Configuration.*
1. **React.js Documentation:** https://reactjs.org/ - *Used for Component Lifecycle and Hooks.*
1. **Razorpay API Reference:** https://razorpay.com/docs/api/ - *Used for Payment Gateway Integration.*
1. **PostgreSQL Official Docs:** https://www.postgresql.org/docs/ - *Used for Database Schema Design.*
1. **Tailwind CSS:** https://tailwindcss.com/ - *Used for Utility-First Styling.*
1. **“System Analysis and Design” by Elias M. Awad** - *Reference for SDLC and Feasibility Study.*
1. **IEEE 830-1998 Standard** - *Reference for Software Requirements Specification (SRS).*

-----
**End of Report**

-----
2

