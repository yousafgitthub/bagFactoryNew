# phase 4.docx — extracted requirements

FOUNDRYFLOW ERP — PHASE 4 MASTER IMPLEMENTATION PROMPT
Complete Production & Manufacturing Management Module
You are continuing development of the existing 
FoundryFlow
 ERP project.
Previous phases
Phase 1: Application Foundation — Completed
Phase 2: Inventory & Warehouse Management — Completed
Phase 3: Recycling Management — Completed
Current task
Implement Phase 4: Complete Production & Manufacturing Management.
This module will manage the factory's complete shopping bag manufacturing workflow, from raw material consumption to finished goods production.
1. CRITICAL PROJECT INSTRUCTIONS
Before implementation:
Inspect the existing project structure.
Review the completed dashboard and navigation.
Review Phase 2 Inventory Management.
Review Phase 3 Recycling Management.
Understand existing raw material inventory structures.
Understand existing recycled material inventory structures.
Understand finished goods inventory structures.
Reuse existing components, forms, tables, calculations and design patterns.
Preserve all previously completed functionality.
Do not recreate Inventory or Recycling modules.
Do not modify the existing design system.
Do not implement Sales Management in this phase.
Do not connect an external database if the project is still using mock data.
Use centralized mock data and existing state management.
All production operations must update the existing inventory records.
The objective is to integrate production with the existing ERP rather than create an isolated manufacturing application.
2. FACTORY BUSINESS BACKGROUND
The factory manufactures shopping bags under two brands:
ABHA
Crystal
Initial product colors:
White
Black
Allow additional brands and colors through configurable settings.
Finished shopping bags are managed in kilograms (kg).
The factory has two possible raw material sources:
A. New Raw Material
New branded raw material purchased externally and maintained in the New Raw Material inventory.
B. Recycled Raw Material
Material generated internally through the Phase 3 recycling process and maintained in the Recycled Material inventory.
MANDATORY PRODUCTION RULE
A production batch must use exactly one raw material source:
New Raw Material, OR
Recycled Raw Material.
Never combine both sources within the same production batch.
The system must preserve the selected source throughout the production batch, inventory movements, costing and production reports.
Do not create a workflow that allows users to add both source types to the same batch.
3. PRODUCTION MODULE STRUCTURE
Add the following pages under the existing sidebar:
Production Management
Production Overview
Production Planning
Production Orders
Create Production Batch
Active Production
Completed Production
Production Consumption
Production Output
Production Loss
Production Costs
Production Reports
Production Settings
Every page must work and follow the existing 
FoundryFlow
 ERP design system.
4. PRODUCTION OVERVIEW DASHBOARD
Create a professional Production Overview dashboard.
KPI Cards
Display:
Total Production Batches
Today's Production (kg)
Monthly Production (kg)
Total Raw Material Consumed (kg)
Finished Goods Produced (kg)
Total Production Loss (kg)
Average Production Yield (%)
Total Production Cost (PKR)
All KPI values must be calculated dynamically from production records.
Charts
A. Monthly Production Trend
Show monthly finished goods output in kg.
B. Raw Material Consumption
Compare:
New Raw Material consumption
Recycled Raw Material consumption
C. Production by Brand
Show:
ABHA production
Crystal production
D. Production by Color
Show production quantities for each configured color.
E. Production Yield Trend
Show yield percentages across production batches.
F. Production Cost Analysis
Show:
Raw material cost
Labor cost
Electricity cost
Machine cost
Other production costs
Recent Production Activity
Display:
Latest batch number
Product
Raw material source
Input quantity
Output quantity
Production date
Batch status
Quick Actions
Create Production Batch
View Active Production
View Production Reports
View Finished Goods Inventory
5. PRODUCTION PLANNING
Create a Production Planning page.
The purpose is to plan upcoming manufacturing requirements.
Planning Fields
Production Plan Number
Planning Date
Planned Production Date
Product Brand
Product
Color
Planned Output Quantity (kg)
Raw Material Source
Required Raw Material Quantity (kg)
Target Production Yield (%)
Priority
Assigned Operator
Notes
Priority
Low
Normal
High
Urgent
Planning Status
Draft
Planned
Approved
In Progress
Completed
Cancelled
Functionality
Create production plan
Edit draft plans
View plan details
Approve plans
Convert approved plans into production batches
Cancel plans with a reason
Search and filter plans
Inventory Availability
When selecting a raw material source, show available stock.
Calculate estimated material requirements using the target yield.
Estimated Input Quantity = Planned Output Quantity ÷ (Target Yield / 100)
Show warnings if the selected material is insufficient.
A production plan must not consume inventory.
Actual stock consumption happens through production batch processing.
6. PRODUCTION ORDERS
Create a Production Orders page.
Each production order must have:
Production Order Number
Order Date
Planned Production Date
Product
Brand
Color
Planned Quantity
Raw Material Source
Priority
Status
Notes
Allow:
Create order
Edit draft order
View details
Approve order
Create production batch from order
Cancel order
Prevent the same production order from creating duplicate active batches unless the order explicitly supports multiple batches.
7. CREATE PRODUCTION BATCH
Build a professional multi-step production batch creation wizard.
STEP 1 — Batch Information
Fields:
Production Batch Number (auto-generated)
Production Date
Production Order Reference (optional)
Operator
Machine / Production Line
Shift (optional)
Notes
Example batch number:
PROD-2026-0001
Every production batch must have a unique reference.
STEP 2 — Select Raw Material Source
Provide a mandatory source selector:
New Raw Material
Recycled Raw Material
This must be a mutually exclusive selection.
After selecting a source:
Display only inventory items belonging to that category.
Display available quantity.
Display warehouse.
Display average cost per kg.
Allow selecting the source warehouse.
Do not display Waste Plastic or Finished Goods as production raw material.
Do not allow selecting both source types.
STEP 3 — Select Product
Fields:
Brand
Product Name
Color
Product Variant
Planned Output Quantity (kg)
Initial product options:
ABHA White Bags
ABHA Black Bags
Crystal White Bags
Crystal Black Bags
Use configurable brand, product and color lists.
STEP 4 — Raw Material Consumption
Fields:
Selected Raw Material
Source Category
Source Warehouse
Available Quantity
Planned Input Quantity (kg)
Actual Input Quantity (kg)
Average Cost per kg
Total Raw Material Cost
Rules:
Actual input quantity must be greater than zero.
Actual input cannot exceed available inventory.
Raw material source must match the selected source category.
One production batch must use only one raw material source.
STEP 5 — Production Output
Fields:
Finished Product
Brand
Color
Actual Finished Output (kg)
Finished Goods Warehouse
Rejected Output (kg), if recorded separately
Notes
Allow the factory to record actual production output.
Do not automatically assume that all input material becomes finished goods.
STEP 6 — Production Loss
Calculate:
Production Loss (kg) = Actual Input Quantity − Actual Finished Output Quantity − Separately Recorded Reusable Byproduct Quantity
If no reusable byproduct is recorded:
Production Loss (kg) = Actual Input Quantity − Actual Finished Output Quantity
Production Loss Percentage = (Production Loss ÷ Actual Input Quantity) × 100
Production Yield (%) = (Actual Finished Output ÷ Actual Input Quantity) × 100
Rules:
Finished output cannot exceed input unless an explicitly recorded additional input or valid measurement adjustment explains it.
Loss cannot be negative.
Rejected output must not be treated as saleable finished goods.
Reusable byproducts must be separately classified and recorded.
Do not silently add processing byproducts to recycled material inventory.
Show live calculations.
STEP 7 — Production Costs
Record:
Raw Material Cost
Labor Cost
Electricity Cost
Machine Cost
Maintenance Cost
Packaging Cost
Transport Cost
Other Costs
Calculate:
Total Production Cost =
Raw Material Cost
Labor Cost
Electricity Cost
Machine Cost
Maintenance Cost
Packaging Cost
Transport Cost
Other Costs
Calculate:
Production Cost per kg = Total Production Cost ÷ Saleable Finished Output Quantity
Handle zero output safely.
STEP 8 — Batch Review
Display:
Batch Number
Date
Product
Brand
Color
Raw Material Source
Raw Material Item
Input Quantity
Output Quantity
Rejected Quantity
Reusable Byproduct, if any
Production Loss
Yield Percentage
Total Production Cost
Production Cost per kg
Input Warehouse
Output Warehouse
Actions:
Save Draft
Start Production
Complete Production
Require confirmation before completing a production batch.
8. PRODUCTION EXECUTION
Create an Active Production page.
Show all batches currently in progress.
Columns:
Batch Number
Product
Brand
Color
Raw Material Source
Planned Quantity
Actual Input Quantity
Start Date
Operator
Machine
Status
Actions
Allow:
View batch
Update production progress
Record actual output
Record additional approved costs
Complete batch
Cancel batch with reason
If production progress percentages are displayed, derive them from recorded progress rather than arbitrary values.
9. PRODUCTION INVENTORY INTEGRATION
This is the most important part of Phase 4.
Connect production directly with the existing Phase 2 Inventory and Phase 3 Recycling modules.
A. When a batch is saved as Draft
Do not deduct raw material stock.
Do not add finished goods stock.
Store draft details only.
B. When production starts
Validate raw material availability.
Confirm selected warehouse.
Reserve or deduct raw material according to the existing inventory architecture.
Prevent other production batches from consuming the same reserved stock.
Record batch status as In Progress.
If the current architecture does not support stock reservation, implement a consistent stock-deduction approach and clearly document it.
C. When production is completed
Finalize actual raw material consumption.
Finalize actual output.
Calculate loss and yield.
Calculate all production costs.
Deduct the consumed quantity from the selected raw material inventory.
Add saleable finished output to Finished Goods inventory.
Preserve the production batch reference.
Record the stock-out movement.
Record the stock-in movement.
Update warehouse balances.
Update inventory dashboard KPIs.
Update production dashboard KPIs.
IMPORTANT:
Deduct only the actual material consumed.
Never deduct the same raw material twice.
Never add the same finished output twice.
Completed batches cannot be completed again.
Cancelled batches must follow safe stock reversal rules.
Rejected products must not enter saleable finished goods stock.
Production output must preserve brand and color.
Maintain batch traceability.
All inventory updates must behave as one consistent operation.
10. PRODUCTION BATCH DETAILS
Create a detailed production batch view.
Batch Overview
Batch Number
Date
Status
Operator
Machine
Production Order Reference
Notes
Raw Material Consumption
Raw Material Source
Raw Material Item
Input Quantity
Cost per kg
Total Material Cost
Warehouse
Finished Production
Product
Brand
Color
Finished Output
Rejected Output
Finished Goods Warehouse
Production Analysis
Input Quantity
Output Quantity
Loss Quantity
Loss Percentage
Yield Percentage
Cost Breakdown
Raw Material
Labor
Electricity
Machine
Maintenance
Packaging
Transport
Other
Total Production Cost
Cost per kg
Stock Movements
Show:
Raw material deduction
Finished goods addition
Transaction references
Movement dates
Batch Timeline
Created
Approved
Production Started
Output Recorded
Production Completed
Adjustments or reversals
Provide print and export options.
11. RAW MATERIAL CONSUMPTION PAGE
Create a dedicated Production Consumption page.
Columns:
Consumption Reference
Batch Number
Production Date
Material Name
Material Source
Warehouse
Quantity Consumed (kg)
Cost per kg
Total Material Cost
Operator
Filters:
Date range
Source category
Material
Warehouse
Batch number
Data must come from actual production batch records.
12. PRODUCTION OUTPUT PAGE
Create a dedicated Production Output page.
Columns:
Output Reference
Batch Number
Date
Product
Brand
Color
Saleable Output (kg)
Rejected Output (kg)
Cost per kg
Finished Goods Warehouse
Status
Filters:
Date range
Brand
Product
Color
Warehouse
Batch number
Every output must link to its production batch and Finished Goods inventory record.
13. PRODUCTION LOSS MANAGEMENT
Create a dedicated Production Loss page.
Display:
Batch Number
Product
Brand
Color
Input Quantity
Finished Output
Reusable Byproduct, if applicable
Production Loss
Loss Percentage
Yield Percentage
Operator
Production Date
Add:
Monthly production loss trend
Average loss percentage
Highest-loss batches
Product-wise loss comparison
Use a configurable loss-warning threshold.
Do not automatically mark a batch as defective merely because its loss percentage is high.
14. PRODUCTION COST MANAGEMENT
Create a Production Cost Analysis page.
Display:
Raw material cost
Labor cost
Electricity cost
Machine cost
Maintenance cost
Packaging cost
Transport cost
Other costs
Total production cost
Average production cost per kg
Provide:
Batch-wise cost comparison
Product-wise cost comparison
Brand-wise cost comparison
Monthly production cost
New material vs recycled material cost comparison
Cost comparisons must distinguish the source material used in each batch.
Do not create full accounting journal entries in this phase.
15. PRODUCTION REPORTS
Create these reports:
Daily Production Report
Monthly Production Report
Batch-wise Production Report
Brand-wise Production Report
Color-wise Production Report
Raw Material Consumption Report
New Material Production Report
Recycled Material Production Report
Production Loss Report
Production Yield Report
Production Cost Report
Finished Goods Output Report
Machine-wise Production Report
Operator-wise Production Report
Features:
Date filters
Brand filters
Product filters
Color filters
Material source filters
Operator filters
Machine filters
CSV export
Print-friendly layouts
Reports must use actual production batch data.
16. PRODUCTION SETTINGS
Create configurable production settings.
Product Configuration
Product brands
Product names
Product colors
Product variants
Product codes
Raw Material Configuration
New material types
Recycled material types
Allowed source categories
Production Configuration
Batch number prefix
Production order prefix
Default unit (kg)
Loss warning threshold
Yield target
Shift configuration
Machine configuration
Operator configuration
Never hardcode a single product or color as the only available option.
17. SAMPLE PRODUCTION DATA
Create realistic sample production batches.
Example:
Production Batch:
PROD-2026-0001
Product:
ABHA White Bags
Raw Material Source:
New Raw Material
Input:
500 kg
Average Raw Material Cost:
Rs. 200/kg
Raw Material Cost:
Rs. 100,000
Additional Costs:
Labor: Rs. 5,000
Electricity: Rs. 3,000
Machine: Rs. 2,000
Other: Rs. 1,000
Finished Output:
450 kg
Production Loss:
50 kg
Yield:
90%
Total Production Cost:
Rs. 111,000
Production Cost per kg:
Rs. 246.67/kg
Create another sample batch using Recycled Raw Material.
The second batch must use only recycled material, never both sources.
Ensure all demo production records are consistent with available raw material inventory and finished goods stock.
Do not generate duplicate inventory movements when loading demo data.
18. UI/UX REQUIREMENTS
Follow the existing 
FoundryFlow
 ERP design system.
Maintain:
Existing sidebar
Existing top navigation
Existing colors
Existing typography
Existing spacing
Existing table design
Existing form components
Existing card design
Existing icon system
Create professional manufacturing interfaces.
Use:
Production status badges
Batch creation wizard
Inventory availability indicators
Live calculation summaries
Confirmation dialogs
Search and filters
Success and error notifications
Empty states
Responsive layouts
Avoid unnecessary redesigns, excessive gradients and decorative animations.
19. TECHNICAL REQUIREMENTS
Continue using the existing project architecture.
Suggested entities:
ProductionPlan
ProductionOrder
ProductionBatch
MaterialConsumption
ProductionOutput
ProductionCost
ProductionLoss
ProductionMachine
ProductionOperator
ProductionSettings
Centralize:
Production calculations
Yield calculations
Loss calculations
Cost calculations
Source validation
Inventory consumption
Finished goods stock addition
Batch state transitions
Use unique references.
Prevent duplicate stock deductions and duplicate output additions.
Prepare structures for future database integration.
Do not create a disconnected inventory dataset.
20. MANDATORY BUSINESS VALIDATIONS
Every production batch must have a unique number.
Every batch must select exactly one raw material source.
New and recycled raw materials cannot be mixed in one batch.
Only New Raw Material or Recycled Raw Material can be consumed.
Waste Plastic cannot be directly consumed in production.
Finished Goods cannot be used as production input.
Input quantity must be greater than zero.
Input quantity cannot exceed available stock.
Finished output cannot exceed valid total input.
Loss cannot be negative.
Rejected output must not be treated as saleable stock.
Finished goods must retain brand and color.
Production costs must be calculated accurately.
Cost per kg must handle zero output safely.
Draft batches must not affect inventory.
Completed batches must update inventory exactly once.
Cancelled batches must preserve history.
Every stock movement must reference its production batch.
All warehouse balances must remain consistent.
Production plans must not consume inventory.
21. FINAL TESTING CHECKLIST
Production Planning
Create a plan.
Edit a draft plan.
Select raw material source.
Verify stock availability.
Verify estimated input requirement.
Confirm plan does not consume inventory.
Production Batch
Create batch using New Raw Material.
Create another batch using Recycled Raw Material.
Verify source separation.
Attempt to select both sources.
Verify the system prevents mixing.
Production Calculations
Enter input quantity.
Enter output quantity.
Calculate loss.
Calculate yield.
Add labor cost.
Add electricity cost.
Add machine cost.
Verify total cost.
Verify cost per kg.
Inventory Integration
Start production.
Verify stock handling.
Complete batch.
Verify raw material deduction.
Verify finished goods addition.
Verify correct product and color.
Verify warehouse.
Verify batch reference.
Verify no duplicate movements.
Validation
Attempt to consume more stock than available.
Attempt output greater than input.
Attempt negative quantities.
Attempt duplicate completion.
Attempt completion with invalid output.
Verify rejected goods do not enter saleable stock.
Reports
Verify production summary.
Verify material consumption.
Verify output report.
Verify loss report.
Verify yield report.
Verify cost report.
Verify CSV export.
Previous Phase Protection
Dashboard must work.
Inventory must work.
Recycling must work.
Warehouse transfers must work.
No previous functionality should be broken.
No duplicate inventory records should be created.
22. COMPLETION REQUIREMENTS
Phase 4 is complete only when the factory can:
Create production plans.
Create production orders.
Create production batches.
Select New Raw Material or Recycled Raw Material.
Prevent mixing of both material sources.
Select ABHA or Crystal products.
Select product colors.
Record raw material consumption.
Record finished output.
Record processing loss.
Record production costs.
Calculate yield.
Calculate production cost per kg.
Automatically deduct raw material inventory.
Automatically add finished goods inventory.
Maintain production batch traceability.
Generate production reports.
Do not start Phase 5 Sales Management.
Do not implement supplier purchasing.
Do not implement double-entry accounting.
Do not connect an external database unless explicitly authorized.
Do not redesign or overwrite previous phases.
At completion, provide:
Pages implemented.
Components created.
Production workflows completed.
Calculations implemented.
Inventory integration details.
Testing results.
Remaining limitations.
Your objective is to deliver a complete, reliable Production Management module integrated with the existing 
FoundryFlow
 ERP.