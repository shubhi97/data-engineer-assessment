import { useState, useEffect } from "react";

// ─── ROLE TYPES ───────────────────────────────────────────────────────
const ROLES = [
  { id: "engineer", label: "Data Engineer", icon: "⚙️", desc: "Azure · AWS · Snowflake · SQL · Python" },
  { id: "analyst",  label: "Data Analyst",  icon: "📊", desc: "Power BI · Tableau · Qlik Sense · SQL · Analytics" },
];

const PLATFORMS_ENG = ["Azure", "AWS", "Snowflake"];
const TOOLS_ANALYST = ["Power BI", "Tableau", "Qlik Sense"];

const BANDS = [
  { id: "junior", label: "Entry Level", color: "#10b981", emoji: "🟢", title: "Entry Level" },
  { id: "mid",    label: "Mid-Level",   color: "#f59e0b", emoji: "🟠", title: "Mid-Level" },
  { id: "senior", label: "Senior/Lead", color: "#8b5cf6", emoji: "🟣", title: "Senior / Lead" },
];

const ENG_CATEGORIES = {
  SQL:         { color: "#38bdf8", tag: "SQL" },
  Cloud:       { color: "#34d399", tag: "Cloud Technology" },
  Python:      { color: "#a78bfa", tag: "Python" },
  Stakeholder: { color: "#f472b6", tag: "Stakeholder Mgmt" },
};

const ANALYST_CATEGORIES = {
  SQL:         { color: "#38bdf8", tag: "SQL" },
  Tool:        { color: "#fb923c", tag: "Analytics Tool" },
  Analytics:   { color: "#34d399", tag: "Analytics & Insight" },
  Stakeholder: { color: "#f472b6", tag: "Stakeholder Mgmt" },
};

// ─── ENGINEER QUESTIONS ───────────────────────────────────────────────
const ENG_QUESTIONS = {
  Azure: {
    junior: [
      { id:1, cat:"SQL",         q:"Write a SQL query to find the top 5 customers by total order value from a table called 'orders' (columns: customer_id, order_date, order_amount).", wtlf:"SELECT customer_id, SUM(order_amount) AS total FROM orders GROUP BY customer_id ORDER BY total DESC FETCH NEXT 5 ROWS ONLY (or TOP 5). Checks GROUP BY, aggregation, ordering." },
      { id:2, cat:"SQL",         q:"Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with a simple example.", wtlf:"INNER = matching rows only; LEFT = all left rows + matching right; FULL OUTER = all rows from both sides. Bonus: demonstrates with an example." },
      { id:3, cat:"Cloud",       q:"What is Azure Data Factory (ADF) and how would you use it to move data from an on-premise SQL Server to Azure Data Lake Storage?", wtlf:"ADF as ETL orchestration; Self-Hosted Integration Runtime to bridge on-premise; source/sink linked services; pipeline + copy activity configuration." },
      { id:4, cat:"Cloud",       q:"What is the difference between Azure Data Lake Storage Gen2 and Azure Blob Storage?", wtlf:"ADLS Gen2: hierarchical namespace, ACL-based security, optimised for big data analytics. Blob: flat namespace, better for unstructured object storage. ADLS Gen2 built on Blob with extra capabilities." },
      { id:5, cat:"Python",      q:"Write a Python script to read a CSV file from a local path into a Pandas DataFrame and print the first 5 rows.", wtlf:"import pandas as pd; pd.read_csv('file.csv'); df.head(). Tests basic Pandas knowledge and file I/O." },
      { id:6, cat:"Python",      q:"What are Python virtual environments and why are they important in a data engineering project?", wtlf:"Isolated dependency management (venv/conda), prevents version conflicts, reproducible environments. Bonus: mention requirements.txt or Poetry." },
      { id:7, cat:"Stakeholder", q:"A business analyst sends an urgent report request by end of day, but you're already committed to a critical pipeline fix. How do you handle this?", wtlf:"Communicates proactively, assesses priority with both parties, proposes realistic timeline, does not silently drop either task. Red flags: over-promising or ignoring one stakeholder." },
      { id:8, cat:"Stakeholder", q:"How would you explain to a non-technical stakeholder why a data pipeline failed and what your remediation plan is?", wtlf:"Plain language (no jargon), clear root cause summary, concrete fix and timeline, reassurance of monitoring. Tests communication adaptability." },
    ],
    mid: [
      { id:1, cat:"SQL",         q:"Write a SQL MERGE statement to upsert changes from a staging table into a slowly changing dimension table.", wtlf:"USING staging ON key match; WHEN MATCHED THEN UPDATE; WHEN NOT MATCHED THEN INSERT. Bonus: handle SCD Type 2 with effective dates." },
      { id:2, cat:"SQL",         q:"Explain query execution plans in Azure Synapse Analytics. How would you identify and resolve a data skew issue?", wtlf:"Reading execution plans; data skew = uneven distribution across distributions; solutions: hash distribution key change, ROUND_ROBIN, statistics update, CTAS to redistribute." },
      { id:3, cat:"Cloud",       q:"Describe how you would design a medallion architecture (Bronze/Silver/Gold) in Azure Data Lake using Azure Databricks.", wtlf:"Bronze: raw ingestion; Silver: cleansed/deduplicated; Gold: aggregated/business-ready. Delta Lake format, partitioning strategy, Databricks notebooks/jobs." },
      { id:4, cat:"Cloud",       q:"What is Azure Synapse Analytics? How does it differ from Azure Databricks, and when would you use each?", wtlf:"Synapse: integrated analytics with dedicated SQL pools + Spark. Databricks: advanced ML/Spark workloads, better for data science collaboration. Choice depends on SQL-heavy vs ML-heavy workloads." },
      { id:5, cat:"Python",      q:"How would you use the azure-storage-blob Python SDK to upload a Pandas DataFrame as a Parquet file to ADLS Gen2?", wtlf:"df.to_parquet() with BytesIO buffer; BlobServiceClient with connection string or credential; upload_blob(). Bonus: use DefaultAzureCredential." },
      { id:6, cat:"Python",      q:"Explain PySpark DataFrames vs Pandas DataFrames. When would you choose one over the other in Azure Databricks?", wtlf:"PySpark: distributed, handles TB-scale; lazy evaluation. Pandas: in-memory, single node, rich ecosystem. Pandas for small datasets/ML prep; PySpark for large distributed processing." },
      { id:7, cat:"Stakeholder", q:"A downstream team claims your pipeline is producing incorrect numbers that differ from their legacy system. How do you investigate and communicate?", wtlf:"Data reconciliation process, cross-checks with source, documents findings with evidence, aligns on definition of 'correct', involves both teams in resolution. Avoids blame." },
      { id:8, cat:"Stakeholder", q:"You've identified a critical architectural improvement requiring 2 weeks of rework. How do you build a business case and get stakeholder buy-in?", wtlf:"Quantifying technical debt impact, translating to business cost, proposing phased delivery, risk framing, clear ROI. Tests influence without authority." },
    ],
    senior: [
      { id:1, cat:"SQL",         q:"Design a SQL strategy for handling late-arriving data in a fact table in Azure Synapse Analytics. How do you ensure idempotency?", wtlf:"Staging + MERGE pattern; watermark columns; UPSERT logic; partitioning on date; hash distribution for upsert target. Idempotency: re-runnable pipelines that don't double-count." },
      { id:2, cat:"SQL",         q:"How would you optimise a complex multi-join query in Synapse Dedicated SQL Pool causing tempdb spill and high execution time?", wtlf:"Statistics update, distribution key alignment (hash on join key), CCI, partition elimination, materialised views, reduce data movement steps in plan." },
      { id:3, cat:"Cloud",       q:"Design a real-time streaming data pipeline on Azure for IoT sensor data: Event Hubs → Stream Analytics → Synapse. Include error handling.", wtlf:"Event Hubs → Stream Analytics (windowing functions) → ADLS/Synapse; dead-letter queue for poison messages; alerting via Azure Monitor; schema evolution strategy." },
      { id:4, cat:"Cloud",       q:"How do you implement data governance and lineage tracking in an Azure data platform at enterprise scale? Reference specific Azure tools.", wtlf:"Microsoft Purview for cataloguing/lineage; Unity Catalog if Databricks; role-based access via Entra ID; sensitivity labels; audit logging in Diagnostic Settings." },
      { id:5, cat:"Python",      q:"How would you implement a robust, retry-enabled data ingestion framework in Python for Azure, handling transient failures and partial loads?", wtlf:"Exponential backoff with tenacity or custom retry; checkpointing state in Azure Table Storage; idempotent writes; structured logging; alerting on permanent failure." },
      { id:6, cat:"Python",      q:"Describe how you would use Python and Delta Lake APIs in Databricks to implement SCD Type 2 at scale with MERGE INTO.", wtlf:"DeltaTable.forName().merge() API; match on business key + is_current flag; WHEN MATCHED update current=False, end_date; WHEN NOT MATCHED insert new row. Partition optimisation." },
      { id:7, cat:"Stakeholder", q:"You're leading a platform migration project. A key business stakeholder keeps requesting scope changes mid-sprint, delaying delivery. How do you manage this?", wtlf:"Formal change request process, impact assessment (time/cost/risk), escalation path if needed, keeping stakeholder engaged while protecting delivery commitments." },
      { id:8, cat:"Stakeholder", q:"Describe a time you had to mediate a disagreement between two teams about data ownership or quality standards.", wtlf:"Structured conflict resolution, data ownership matrix (RACI), facilitating alignment on shared standards, executive escalation only when needed." },
    ],
  },
  AWS: {
    junior: [
      { id:1, cat:"SQL",         q:"Write a SQL query to calculate the 7-day rolling average of daily sales from a table 'daily_sales' (columns: sale_date, total_sales).", wtlf:"AVG(total_sales) OVER (ORDER BY sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). Tests window function knowledge." },
      { id:2, cat:"SQL",         q:"What is the difference between WHERE and HAVING clauses in SQL? Give an example where HAVING is necessary.", wtlf:"WHERE filters before aggregation; HAVING filters after. Example: sales > 1000 in WHERE vs total per group in HAVING." },
      { id:3, cat:"Cloud",       q:"What is Amazon S3 and how would you use it as a data lake foundation? What are S3 storage classes?", wtlf:"S3 as object storage; bucket/prefix structure for data lake; storage classes: Standard, IA, Glacier for cost tiering; versioning and lifecycle policies." },
      { id:4, cat:"Cloud",       q:"Explain the difference between AWS Glue and AWS Lambda for data processing tasks.", wtlf:"Glue: managed ETL, Spark-based, for large batch transformations, has Data Catalog. Lambda: serverless functions, event-driven, for lightweight/trigger-based tasks." },
      { id:5, cat:"Python",      q:"Write a Python function to connect to Amazon S3 using boto3 and list all files in a given bucket prefix.", wtlf:"import boto3; s3 = boto3.client('s3'); s3.list_objects_v2(Bucket=..., Prefix=...). Handles pagination as a bonus." },
      { id:6, cat:"Python",      q:"What is the difference between Python's list, tuple, and dictionary? Give data engineering use cases for each.", wtlf:"List: ordered mutable (column values); Tuple: immutable (schema definition); Dict: key-value (row mapping, config dicts, JSON records)." },
      { id:7, cat:"Stakeholder", q:"Your manager asks for a dashboard by Friday but you discover the source data is missing for two of the five required metrics. What do you do?", wtlf:"Immediately surfaces the gap, quantifies what IS deliverable, proposes interim solution (partial dashboard with caveats), does not hide the problem until Friday." },
      { id:8, cat:"Stakeholder", q:"How do you keep stakeholders informed about the progress of a long-running data migration project?", wtlf:"Regular status cadence, milestone tracking, risk flagging early, single source of truth (JIRA/Confluence), escalation thresholds defined upfront." },
    ],
    mid: [
      { id:1, cat:"SQL",         q:"Write a SQL query using window functions to rank employees within each department by salary and return only rank 1 and 2 per department.", wtlf:"DENSE_RANK() or RANK() OVER (PARTITION BY dept ORDER BY salary DESC); filter WHERE rank <= 2." },
      { id:2, cat:"SQL",         q:"How do you handle NULL values in aggregate functions and JOIN conditions in SQL? Why does this matter in data engineering?", wtlf:"NULLs ignored in aggregates (use COALESCE/NULLIF); NULLs never equal in JOINs (use IS NULL). Must handle explicitly to prevent silent data loss." },
      { id:3, cat:"Cloud",       q:"Describe how you would build a serverless ETL pipeline using AWS Glue, S3, and Athena to process daily JSON files.", wtlf:"S3 trigger → Glue Crawler → Glue Job (PySpark) → Parquet output to S3 → Athena for querying. Partition strategy included." },
      { id:4, cat:"Cloud",       q:"What is AWS Redshift Spectrum and how does it differ from querying data in a Redshift cluster?", wtlf:"Spectrum: queries S3 data directly via external tables without loading into cluster. Good for cold/archival data or data lake federation." },
      { id:5, cat:"Python",      q:"How do you use PySpark in AWS Glue to read a partitioned Parquet dataset from S3, filter records, and write back to a different S3 location?", wtlf:"GlueContext or SparkContext; spark.read.parquet('s3://...'); .filter(); .write.mode('overwrite').parquet('s3://...'); partition pruning with pushdown predicates." },
      { id:6, cat:"Python",      q:"Explain Python decorators and give a practical data engineering example of when you'd write one.", wtlf:"Decorator = function wrapper; use cases: retry logic, logging, timing, circuit breakers for API calls." },
      { id:7, cat:"Stakeholder", q:"A data science team is frustrated that your pipelines deliver data too slowly for their ML model retraining schedule. How do you resolve this?", wtlf:"SLA discussion, root cause analysis (batch vs stream, schedule times), incremental loading option, aligning on acceptable latency, formalising an SLA agreement." },
      { id:8, cat:"Stakeholder", q:"How do you manage competing priorities between the infrastructure team (wanting stability) and analytics teams (wanting new features quickly)?", wtlf:"Product-style backlog prioritisation, risk/benefit framing, staging environment for new features, regular joint ceremonies." },
    ],
    senior: [
      { id:1, cat:"SQL",         q:"How would you implement incremental data loading in Redshift using watermark-based change detection? Address schema evolution.", wtlf:"MAX(updated_at) watermark in control table; incremental COPY or MERGE; schema evolution handled with ALTER TABLE ADD COLUMN or SUPER type." },
      { id:2, cat:"SQL",         q:"Explain distribution keys and sort keys in Amazon Redshift. How do poor choices affect query performance, and how would you diagnose this?", wtlf:"Distribution keys: co-locate join data. Sort keys: zone maps for range scans. Diagnosis: STL_EXPLAIN, SVV_TABLE_INFO, ANALYZE COMPRESSION, VACUUM usage." },
      { id:3, cat:"Cloud",       q:"Design a cost-optimised, fault-tolerant data lakehouse on AWS for petabyte-scale analytics. Walk through your architecture choices.", wtlf:"S3, Glue Catalog, Iceberg/Delta for ACID, Athena/Redshift Spectrum for ad-hoc, EMR or Glue for processing, Kinesis for streaming, Lake Formation for governance." },
      { id:4, cat:"Cloud",       q:"How would you implement data quality monitoring and alerting in an AWS data platform at scale? Reference specific services.", wtlf:"AWS Glue DataBrew or Great Expectations; results in S3/DynamoDB; CloudWatch metrics + alarms; SNS notifications; quarantine bucket for bad records." },
      { id:5, cat:"Python",      q:"How would you design a Python-based framework for orchestrating complex, dependency-aware ETL jobs on AWS Step Functions?", wtlf:"Step Functions state machine in JSON/CDK; Lambda/ECS tasks; error catching and retry states; parallel branches; idempotency tokens; logging to CloudWatch." },
      { id:6, cat:"Python",      q:"Describe your approach to unit testing and integration testing PySpark jobs deployed on AWS Glue or EMR.", wtlf:"pyspark local mode for unit tests; mocking S3 with moto; pytest fixtures; integration tests against dev environment; CI/CD pipeline with test gates." },
      { id:7, cat:"Stakeholder", q:"You discover that a data product your team owns is being used in a critical regulatory report you were never informed about. How do you handle this?", wtlf:"Data discovery process gap identified; immediate impact assessment; formalise SLA for that dataset; work with governance team to document." },
      { id:8, cat:"Stakeholder", q:"As a senior engineer, how do you mentor junior engineers while managing your own delivery commitments and stakeholder expectations?", wtlf:"Structured pairing/code reviews, delegating with clear ownership, setting boundaries on availability, tracking team capacity, shielding juniors from noise." },
    ],
  },
  Snowflake: {
    junior: [
      { id:1, cat:"SQL",         q:"Write a SQL query in Snowflake to count the number of orders per customer per month, using date_trunc.", wtlf:"DATE_TRUNC('month', order_date) AS month; GROUP BY customer_id, month; COUNT(*). Tests Snowflake date functions and aggregation." },
      { id:2, cat:"SQL",         q:"Explain the difference between a CTE (WITH clause) and a subquery. When would you prefer one over the other?", wtlf:"CTE: readable, reusable in same query, better for recursive logic. Subquery: inline, sometimes optimised differently. CTEs preferred for readability." },
      { id:3, cat:"Cloud",       q:"What is a Snowflake Virtual Warehouse and how does auto-suspend/auto-resume help control costs?", wtlf:"Virtual Warehouse = compute cluster (XS to 6XL). Auto-suspend stops billing when idle; auto-resume starts on query. Separates compute from storage." },
      { id:4, cat:"Cloud",       q:"What are Snowflake stages? What is the difference between an internal stage and an external stage?", wtlf:"Internal: Snowflake-managed storage (user/table/named); External: points to S3/ADLS/GCS. Used with COPY INTO for bulk loading." },
      { id:5, cat:"Python",      q:"How would you use the Snowflake Python Connector to execute a query and fetch results into a Pandas DataFrame?", wtlf:"snowflake.connector.connect(...); cursor.execute('SELECT...'); fetch_pandas_all() or fetchall() + pd.DataFrame(). Bonus: use context manager." },
      { id:6, cat:"Python",      q:"What is a Python generator and how might you use one when processing large result sets from Snowflake?", wtlf:"Generator: yields one row at a time, memory efficient. Use case: iterating cursor.fetchone() or chunked fetchmany() instead of loading all rows into memory." },
      { id:7, cat:"Stakeholder", q:"A business user says 'the numbers look wrong' in a report you built. How do you approach this conversation and investigation?", wtlf:"Takes concern seriously without defensiveness, asks for specifics (which metric, date range), traces back to source, documents findings, communicates ETA." },
      { id:8, cat:"Stakeholder", q:"You are new to a team. How would you identify and build relationships with key stakeholders in your first 30 days?", wtlf:"Stakeholder mapping, scheduling 1:1 introductions, understanding their data needs, identifying pain points, reviewing existing documentation." },
    ],
    mid: [
      { id:1, cat:"SQL",         q:"Write a Snowflake SQL query to detect duplicate records in a table using ROW_NUMBER(), and delete all but the most recent entry.", wtlf:"ROW_NUMBER() OVER (PARTITION BY key_cols ORDER BY updated_at DESC); DELETE WHERE row_num > 1 via CTE or subquery." },
      { id:2, cat:"SQL",         q:"Explain Snowflake's FLATTEN function and VARIANT type. When would you use them?", wtlf:"VARIANT: semi-structured JSON/XML/Avro storage. FLATTEN: lateral explodes arrays within VARIANT into rows. Used for parsing nested JSON payloads." },
      { id:3, cat:"Cloud",       q:"What is Snowpipe and how does it enable continuous, near-real-time data ingestion into Snowflake?", wtlf:"Snowpipe: serverless, event-triggered COPY INTO; uses S3/Azure/GCS event notifications; micro-batch loading within seconds; billed per credit usage." },
      { id:4, cat:"Cloud",       q:"Explain Snowflake's Time Travel and Fail-Safe features. How would you use them in a data engineering context?", wtlf:"Time Travel: query/restore historical data up to 90 days. Fail-Safe: 7-day disaster recovery by Snowflake support. Use for accidental deletes, debugging, audit." },
      { id:5, cat:"Python",      q:"How would you use Snowflake dbt Python models to transform data in Snowflake? What are the advantages over SQL models?", wtlf:"Python dbt models run as Snowpark stored procs; useful for ML-like transformations, Pandas ops, external library integration." },
      { id:6, cat:"Python",      q:"How do you use Snowpark for Python to process data directly in Snowflake without extracting it? Give a transformation example.", wtlf:"snowpark Session; session.table(); DataFrame.filter/groupBy/agg; lazy evaluation pushed to Snowflake engine; write back with .save_as_table()." },
      { id:7, cat:"Stakeholder", q:"Mid-project, you learn that the data model you built doesn't meet new compliance requirements. How do you communicate this and re-plan?", wtlf:"Immediate notification to project lead, impact scope assessment, propose minimal-change remediation, realistic revised timeline, document decision log." },
      { id:8, cat:"Stakeholder", q:"How do you handle a situation where two business teams want the same metric defined differently in your data model?", wtlf:"Facilitates alignment meeting, documents both definitions, builds separate agreed metrics if genuinely different, prevents 'two versions of truth'." },
    ],
    senior: [
      { id:1, cat:"SQL",         q:"How would you design and implement a slowly changing dimension (SCD Type 2) in Snowflake using MERGE and streams?", wtlf:"Snowflake Stream on source table for CDC; MERGE INTO dimension with WHEN MATCHED (close old row) and WHEN NOT MATCHED (insert); effective_from / is_current columns." },
      { id:2, cat:"SQL",         q:"What are Snowflake Dynamic Tables and how do they simplify incremental transformation pipelines?", wtlf:"Dynamic Tables: declarative, auto-refreshed materialised views with lag targets; replaces task+stream+MERGE pattern; Snowflake manages refresh frequency." },
      { id:3, cat:"Cloud",       q:"Design a cost governance strategy for a large Snowflake deployment with multiple teams. What controls and monitoring would you implement?", wtlf:"Resource monitors per warehouse/role; Query Tags for attribution; ACCOUNT_USAGE views for cost dashboards; dedicated warehouses per workload type." },
      { id:4, cat:"Cloud",       q:"How would you architect a multi-cloud, multi-region data sharing strategy using Snowflake Secure Data Sharing and Data Clean Rooms?", wtlf:"Snowflake Data Sharing (no data movement); Data Marketplace; Data Clean Rooms for privacy-preserving joins; replication for cross-region; row access policies." },
      { id:5, cat:"Python",      q:"How would you build a CI/CD pipeline for Snowflake dbt models using Python tooling, including automated testing across environments?", wtlf:"dbt CLI in GitHub Actions/GitLab CI; dbt test for schema/data quality; dev→staging→prod promotion; Snowflake secrets in vault; Slim CI (dbt state:modified)." },
      { id:6, cat:"Python",      q:"Describe how Snowpark Machine Learning enables in-database model training. When is this preferable to training models outside Snowflake?", wtlf:"Snowpark ML: trains sklearn/XGBoost inside Snowflake; no data egress; model registry in Snowflake. Preferred when data is large, sensitive, or egress is costly." },
      { id:7, cat:"Stakeholder", q:"You're presenting a proposal to migrate from a legacy on-premise data warehouse to Snowflake to executive leadership. How do you structure your case?", wtlf:"Business outcome focus (cost, speed, scalability); ROI analysis; risk mitigation plan; phased approach; reference to similar migrations; handles pushback confidently." },
      { id:8, cat:"Stakeholder", q:"How do you establish and maintain data SLAs with business stakeholders, and what happens when you breach one?", wtlf:"Upfront SLA definition (freshness, accuracy, availability); monitoring dashboards; breach notification protocol; post-mortem process; continuous improvement culture." },
    ],
  },
};

// ─── ANALYST QUESTIONS ────────────────────────────────────────────────
const ANALYST_QUESTIONS = {
  "Power BI": {
    junior: [
      { id:1, cat:"SQL",         q:"Write a SQL query to calculate total sales by region and month from a table 'sales' (columns: sale_date, region, amount). How would you use this in Power BI?", wtlf:"SELECT region, FORMAT(sale_date,'yyyy-MM') AS month, SUM(amount) FROM sales GROUP BY region, FORMAT(sale_date,'yyyy-MM'). Should mention importing via DirectQuery or Import mode in Power BI." },
      { id:2, cat:"SQL",         q:"What is the difference between a fact table and a dimension table? Give an example relevant to a sales dashboard.", wtlf:"Fact: measurable events (sales transactions, quantities, amounts). Dimension: descriptive context (product, customer, date). Star schema: fact in centre, dimensions around it. Essential for Power BI data modelling." },
      { id:3, cat:"Tool",        q:"What is the difference between Import mode and DirectQuery mode in Power BI? When would you use each?", wtlf:"Import: data loaded into Power BI memory, fast, limited by dataset size, scheduled refresh. DirectQuery: live queries to source, always fresh, slower, limited DAX. Use Import for performance; DirectQuery for real-time or large data." },
      { id:4, cat:"Tool",        q:"Explain what a DAX measure is and write a simple example to calculate Year-to-Date (YTD) sales.", wtlf:"DAX measure = formula evaluated in filter context. YTD Sales = CALCULATE(SUM(Sales[Amount]), DATESYTD(Date[Date])). Must understand CALCULATE and time intelligence functions." },
      { id:5, cat:"Analytics",   q:"A bar chart in your Power BI report is showing incorrect totals. Walk me through how you would debug this.", wtlf:"Check data source for duplicates or nulls; verify relationships (1:many, cross-filter direction); check measure logic (SUM vs COUNT); validate DAX filter context; confirm date table is marked as date table." },
      { id:6, cat:"Analytics",   q:"What are slicers and filters in Power BI? How do they differ and when would you use each?", wtlf:"Slicers: visual, user-interactive filtering on the canvas. Filters: panel-based, can be page/report/visual level. Slicers for end-user exploration; filters for fixed analytical constraints. Cross-filtering between visuals also relevant." },
      { id:7, cat:"Stakeholder", q:"A business manager says 'the numbers in your Power BI report don't match what I see in Excel'. How do you handle this?", wtlf:"Don't dismiss; ask for specific examples (date range, filters applied); trace data lineage from source to report; check for different business logic definitions; document and align on single source of truth." },
      { id:8, cat:"Stakeholder", q:"How would you gather requirements from a non-technical stakeholder before building a Power BI dashboard?", wtlf:"Discovery session: understand audience, decisions the dashboard should drive, KPIs needed, data sources available, refresh frequency, device (mobile/desktop). Prototype with wireframe before building. Iterative feedback loop." },
    ],
    mid: [
      { id:1, cat:"SQL",         q:"Write a SQL query using window functions to calculate a running total of monthly revenue and the month-over-month percentage change.", wtlf:"SUM(revenue) OVER (ORDER BY month ROWS UNBOUNDED PRECEDING) for running total; LAG(revenue) OVER (ORDER BY month) for prior month; (current - prior)/prior * 100 for % change. Tests advanced SQL for analytics." },
      { id:2, cat:"SQL",         q:"How would you optimise a slow SQL query that joins 4 large tables in your reporting database? What steps would you take?", wtlf:"Check execution plan; add appropriate indexes; reduce columns selected (avoid SELECT *); filter early with WHERE; consider materialised views or aggregation tables; avoid functions on indexed columns. Tests performance thinking." },
      { id:3, cat:"Tool",        q:"Explain the difference between calculated columns and measures in Power BI. When would you use each and what are the performance implications?", wtlf:"Calculated column: row-by-row evaluation at refresh time, stored in model, increases file size. Measure: evaluated at query time in filter context, no storage overhead. Prefer measures for aggregations; calculated columns for row-level categorisation." },
      { id:4, cat:"Tool",        q:"What is Row Level Security (RLS) in Power BI and how would you implement it for a regional sales dashboard where managers only see their region's data?", wtlf:"RLS: restrict data access by user role. Static RLS: fixed DAX filter per role. Dynamic RLS: USERNAME() or USERPRINCIPALNAME() matched to a user-region table. Publish and assign users to roles in Power BI Service." },
      { id:5, cat:"Analytics",   q:"Describe how you would design a Power BI data model for a retail business with sales, products, customers, and a date dimension.", wtlf:"Star schema: FactSales (transaction grain) with DimProduct, DimCustomer, DimDate dimensions. Single active relationship per table pair. Mark date table. Avoid many-to-many unless required. Hide foreign keys from report view." },
      { id:6, cat:"Analytics",   q:"How would you build a KPI dashboard in Power BI that shows actuals vs targets with traffic light indicators?", wtlf:"Import actuals and targets tables; relate on common key; DAX measure for variance and % achievement; KPI visual or conditional formatting with rules (green >=100%, amber >=80%, red <80%); card visuals for headline numbers." },
      { id:7, cat:"Stakeholder", q:"You've been asked to consolidate 5 different Excel-based reports used by different teams into a single Power BI dashboard. How do you approach this project?", wtlf:"Stakeholder interviews to understand each report's purpose and audience; data source mapping; identify common metrics vs team-specific; design unified data model; phased delivery (core metrics first); change management and training plan." },
      { id:8, cat:"Stakeholder", q:"A senior director wants a new metric added to the dashboard 'urgently' but it requires significant data model changes. How do you handle this?", wtlf:"Acknowledge urgency; assess impact on model, existing reports, and refresh times; present options (quick workaround vs proper solution with timeline); agree on priority with stakeholder; document decision. Shows structured thinking under pressure." },
    ],
    senior: [
      { id:1, cat:"SQL",         q:"Design a SQL-based aggregation strategy for a Power BI report serving 500+ users with sub-second response times on a 100M row fact table.", wtlf:"Aggregation tables at summary grain; Power BI aggregations feature with automatic fallback; partitioning on date; columnstore indexes; consider Azure Analysis Services or Premium for large-scale caching; Composite model for mixed DirectQuery/Import." },
      { id:2, cat:"SQL",         q:"How would you implement a slowly changing dimension (Type 2) in your data warehouse to support historical trend analysis in Power BI?", wtlf:"SCD Type 2: add effective_from, effective_to, is_current columns; MERGE statement for updates; bridge table for many-to-many historical relationships. In Power BI: use role-playing dimensions or active/inactive relationships with USERELATIONSHIP()." },
      { id:3, cat:"Tool",        q:"Explain Power BI's Composite Model and how you would use it to combine a large DirectQuery source with an imported dimension table.", wtlf:"Composite Model: mix Import and DirectQuery tables in one model. DirectQuery for large fact table (live data); Import for small, slowly-changing dimensions (fast lookups). Set storage mode per table; manage relationship cardinality carefully. Use aggregations for performance." },
      { id:4, cat:"Tool",        q:"How would you architect a Power BI deployment for an enterprise with 1000+ users, multiple business units, and strict data governance requirements?", wtlf:"Power BI Premium or Fabric capacity; centralised dataset strategy (shared certified datasets); workspace separation by domain; deployment pipelines (dev/test/prod); RLS/OLS for data security; sensitivity labels via Purview; usage monitoring via Activity Log and admin APIs." },
      { id:5, cat:"Analytics",   q:"Describe your approach to building a self-service analytics capability in Power BI while maintaining data governance and a single source of truth.", wtlf:"Certified/promoted datasets as governed foundation; dataflows for reusable transformations; training programme for self-service report authors; endorsement workflow; monitor dataset usage; data dictionary and lineage via Purview; governance committee sign-off for new sources." },
      { id:6, cat:"Analytics",   q:"How would you use Power BI's AI features (Smart Narrative, Anomaly Detection, Key Influencers) to enhance an executive dashboard?", wtlf:"Smart Narrative: auto-generated text summaries of chart trends. Anomaly Detection: automatic spike/dip flagging on time series. Key Influencers: identifies which factors drive a metric. Should discuss when these add value vs when they confuse non-technical users. Customisation and limitations awareness." },
      { id:7, cat:"Stakeholder", q:"You're leading a Power BI Centre of Excellence (CoE). How do you balance enabling business users to build their own reports while maintaining quality and governance?", wtlf:"Tiered model: governed datasets + self-service report layer; certification workflow for promoted content; training academy; community of practice; report review process for enterprise-wide dashboards; clear ownership model (IT vs business). Measures adoption and report quality metrics." },
      { id:8, cat:"Stakeholder", q:"Describe a time you influenced a major analytics or BI decision at an organisational level. What was your approach and what was the outcome?", wtlf:"Looks for: structured business case (quantified benefit), stakeholder mapping, handling resistance, data-driven argument, executive communication skills, lessons learned. Evidence of strategic thinking beyond technical delivery." },
    ],
  },
  "Tableau": {
    junior: [
      { id:1, cat:"SQL",         q:"Write a SQL query to find the top 10 products by revenue for the last 12 months. How would you connect this to Tableau?", wtlf:"SELECT product, SUM(revenue) FROM sales WHERE sale_date >= DATEADD(month,-12,GETDATE()) GROUP BY product ORDER BY SUM(revenue) DESC TOP 10. Tableau: connect via live or extract; custom SQL or published data source." },
      { id:2, cat:"SQL",         q:"What is a star schema and why is it preferred for Tableau data sources over highly normalised OLTP schemas?", wtlf:"Star schema: fact table + denormalised dimensions. Preferred in Tableau because fewer joins = faster performance; Tableau handles single joins well; reduces query complexity. OLTP schemas cause slow, complex multi-join queries in Tableau." },
      { id:3, cat:"Tool",        q:"What is the difference between a live connection and an extract in Tableau? When would you choose each?", wtlf:"Live: always queries source directly, always fresh, performance depends on DB. Extract: snapshot stored in Tableau's .hyper format, very fast, scheduled refresh. Use live for real-time needs; extract for performance and offline access." },
      { id:4, cat:"Tool",        q:"Explain the difference between dimensions and measures in Tableau. What happens when you place each on the Rows/Columns shelf?", wtlf:"Dimensions: categorical, create headers/partitions (blue pills). Measures: quantitative, create axes (green pills). Dimensions on Rows/Columns partition the view; measures create axes with aggregation (SUM, AVG etc.). Discrete vs continuous also relevant." },
      { id:5, cat:"Analytics",   q:"A line chart in Tableau is showing gaps in the data for certain months. How would you investigate and fix this?", wtlf:"Check for missing dates in source data (use Show Missing Values in Tableau); verify date field type; check date filters; use a date scaffold/spine table joined to fill gaps; confirm aggregate function isn't excluding nulls unexpectedly." },
      { id:6, cat:"Analytics",   q:"How do you create a calculated field in Tableau? Write a simple example to classify customers as 'High', 'Medium', or 'Low' value.", wtlf:"Analysis > Create Calculated Field. Example: IF SUM([Revenue]) > 10000 THEN 'High' ELSEIF SUM([Revenue]) > 5000 THEN 'Medium' ELSE 'Low' END. Tests basic Tableau calculation syntax and logic." },
      { id:7, cat:"Stakeholder", q:"A stakeholder says they want 'everything' on one dashboard. How do you manage this request?", wtlf:"Acknowledge their need for comprehensive view; guide them to identify primary decisions the dashboard should support; prioritise top 5-7 metrics; design for the audience (exec vs analyst); use actions and drill-through for depth without clutter. Push back constructively." },
      { id:8, cat:"Stakeholder", q:"How would you present a Tableau dashboard to a non-technical executive audience for the first time?", wtlf:"Focus on insights not features; lead with the headline KPI; use annotations to highlight key findings; walk through a story not a demo; anticipate questions; keep it to 3-5 key points; provide a leave-behind or published link. Tests communication skills." },
    ],
    mid: [
      { id:1, cat:"SQL",         q:"Write a SQL query to calculate cohort retention: for each monthly acquisition cohort, show what % of customers were still active in months 1, 2, and 3 after acquisition.", wtlf:"Cohort analysis: assign acquisition_month; join to activity by customer_id; calculate months since acquisition; aggregate active customers per cohort per period; divide by cohort size. Tests advanced analytical SQL thinking." },
      { id:2, cat:"SQL",         q:"How would you design a summary/aggregation table in SQL to improve Tableau dashboard performance on a 500M row transactions table?", wtlf:"Pre-aggregate at the grain required by the dashboard (daily/weekly by product/region); store in a separate summary table; refresh on a schedule; connect Tableau to summary table. Discuss trade-offs: data freshness vs performance vs maintenance overhead." },
      { id:3, cat:"Tool",        q:"Explain Level of Detail (LOD) expressions in Tableau. Write an example using FIXED to calculate each customer's first purchase date.", wtlf:"LOD expressions compute aggregations at a specified granularity independently of the view's level of detail. FIXED LOD: {FIXED [Customer ID] : MIN([Order Date])}. INCLUDE adds dimensions; EXCLUDE removes them. Tests understanding of context vs LOD scope." },
      { id:4, cat:"Tool",        q:"What are Tableau Table Calculations? Give an example of a running total and explain the difference between Compute Using Table Across vs Down.", wtlf:"Table calculations: computed on the aggregated result set in Tableau, not the raw data. Running Total: RUNNING_SUM(SUM([Sales])). Table Across: computes across columns (left to right). Table Down: computes down rows (top to bottom). Partition and addressing are key concepts." },
      { id:5, cat:"Analytics",   q:"How would you build a Tableau dashboard to analyse customer churn, showing churn rate by segment, trend over time, and key drivers?", wtlf:"Define churn (no activity in N days); calculate churn rate by segment; trend line with reference bands; use a scatter or bar to show segment comparison; table calc or LOD for cohort-based churn; consider a story or guided analytics flow. Tests end-to-end analytical thinking." },
      { id:6, cat:"Analytics",   q:"Describe how you would use Tableau's set actions and parameter actions to build an interactive drill-down dashboard.", wtlf:"Set actions: update a set based on user selection (click/hover/menu); use set in calculations to highlight or filter. Parameter actions: update a parameter value from a mark selection; use parameter in calculated fields or reference lines. Enables highly interactive dashboards without LOD complexity." },
      { id:7, cat:"Stakeholder", q:"You've delivered a Tableau dashboard but users aren't adopting it. What steps would you take to improve adoption?", wtlf:"User interviews to understand friction points; usability testing; check if dashboard answers their actual questions; simplify navigation; add training/documentation; ensure performance is acceptable; involve champions from business; measure usage via Tableau Server/Cloud admin." },
      { id:8, cat:"Stakeholder", q:"How do you manage a situation where different business teams are using different Tableau dashboards with conflicting metrics for the same KPI?", wtlf:"Audit all dashboards and definitions; facilitate alignment workshop; agree on single certified definition; build governed shared data source; deprecate inconsistent dashboards with clear communication; update data dictionary. Tests data governance mindset." },
    ],
    senior: [
      { id:1, cat:"SQL",         q:"Design a SQL-based data architecture to support a Tableau reporting layer for a multinational business with regional databases, daily data loads, and sub-5-second dashboard response times.", wtlf:"Centralised data warehouse with regional ETL pipelines; aggregation layer for Tableau; Tableau extracts (.hyper) on schedule; consider Hyper API for large extract generation; partitioned tables; columnar storage. Discuss trade-offs between centralisation and latency." },
      { id:2, cat:"SQL",         q:"How would you implement incremental extract refreshes in Tableau using SQL incremental load patterns? What are the limitations?", wtlf:"Tableau incremental refresh: appends rows where a datetime column > last extract date. SQL side: ensure updated_at column is indexed and updated correctly. Limitations: doesn't handle updates or deletes (only inserts); full refresh needed periodically. Alternative: Tableau Hyper API for full programmatic control." },
      { id:3, cat:"Tool",        q:"How would you architect a Tableau Server or Tableau Cloud deployment for 2000 users with strict performance SLAs and data security requirements?", wtlf:"Tableau Server: multi-node with gateway, primary, worker nodes; extract scheduling to off-peak; site separation for isolation; RLS via user filters or entitlement tables; data source certification; performance monitoring via admin views; Tableau Blueprint governance framework." },
      { id:4, cat:"Tool",        q:"Explain Tableau's Virtual Connections and Data Policies. How do they support centralised data governance?", wtlf:"Virtual Connections: centralised, reusable connection objects managed by data stewards; decouple connection credentials from individual data sources. Data Policies: row-level security applied at the Virtual Connection level, enforced across all downstream content. Reduces RLS maintenance overhead significantly." },
      { id:5, cat:"Analytics",   q:"Describe how you would use Tableau Prep and Tableau Cloud together to build a governed, automated analytics pipeline from raw data to published dashboard.", wtlf:"Tableau Prep Builder: data cleaning, shaping, aggregation; Prep Conductor (on Cloud/Server) for scheduled runs; output to published data source on Tableau Cloud; certified data source used by analysts for self-service. Lineage tracking, version control, notification on failure. End-to-end governed pipeline." },
      { id:6, cat:"Analytics",   q:"How would you use Tableau's Einstein (AI) features or statistical capabilities to surface predictive insights in an operational dashboard?", wtlf:"Forecast: built-in exponential smoothing with confidence intervals. Trend Lines: statistical models (linear, polynomial, exponential). Tableau AI/Einstein: natural language Q&A, automated insights. R/Python integration for custom models via TabPy or RServe. Discuss when to use built-in vs custom modelling." },
      { id:7, cat:"Stakeholder", q:"You are leading a Tableau practice across a 500-person organisation. How do you build a data culture and ensure analytics investments deliver measurable business value?", wtlf:"Analytics champions programme; self-service training curriculum; metrics for adoption (DAU, published views, certified sources); business value tracking (decisions influenced, time saved); executive sponsorship; community of practice; regular showcases of impactful dashboards. Links analytics to business outcomes." },
      { id:8, cat:"Stakeholder", q:"Describe a complex analytics project you led where the initial brief changed significantly. How did you manage stakeholders and deliver value?", wtlf:"Looks for: structured change management approach, impact assessment, re-scoping conversation, maintaining trust under ambiguity, iterative delivery, lessons applied to future projects. Evidence of senior-level stakeholder management and analytical leadership." },
    ],
  },
  "Qlik Sense": {
    junior: [
      { id:1, cat:"SQL",         q:"Write a SQL query to summarise total orders and average order value by customer segment and month. How would you load this into Qlik Sense?", wtlf:"SELECT segment, FORMAT(order_date,'yyyy-MM') AS month, COUNT(*) AS orders, AVG(order_value) AS avg_value FROM orders GROUP BY segment, FORMAT(order_date,'yyyy-MM'). Qlik: load via ODBC/JDBC connector or inline load script; QVD for performance." },
      { id:2, cat:"SQL",         q:"What is a surrogate key and why is it important when building data models for BI tools like Qlik Sense?", wtlf:"Surrogate key: system-generated unique identifier (integer sequence) vs natural business key. Important in Qlik: needed to associate tables correctly in the data model; avoids synthetic key issues caused by multiple common fields. Ensures clean associations." },
      { id:3, cat:"Tool",        q:"What is Qlik Sense's Associative Model and how is it different from traditional query-based BI tools like SQL reporting?", wtlf:"Associative Model: all data is loaded into memory; selections propagate across all associated tables simultaneously (green = selected, white = associated, grey = excluded). No pre-defined drill paths. Users can explore in any direction. Different from SQL: no WHERE clause requery needed per selection." },
      { id:4, cat:"Tool",        q:"What is a QVD file in Qlik and why is it used? Explain the QVD layer in a typical Qlik architecture.", wtlf:"QVD (Qlik View Data): binary data format optimised for Qlik; extremely fast to load; compressed. QVD layer: staging area between source and app; raw QVDs from source, transformed QVDs for consumption. Enables incremental loads and separates ETL from reporting apps. Reduces source system load." },
      { id:5, cat:"Analytics",   q:"A KPI chart in Qlik Sense is showing 'null' values unexpectedly. How would you debug this?", wtlf:"Check load script: NullAsValue or NullInterpret settings; inspect raw data for nulls in key fields; check master measure expression for division by zero or empty set; use IsNull() in expression; verify association between tables is correct (no broken keys). Systematic debug approach." },
      { id:6, cat:"Analytics",   q:"How do you create a set analysis expression in Qlik Sense? Write an example to calculate total sales for the previous year regardless of current year filter.", wtlf:"Set analysis: calculates aggregation in a defined set context. Example: SUM({<Year={$(=Year(Today())-1)}>} Sales). Curly braces = set modifier; angle brackets = field modifier; dollar sign expansion for dynamic values. Tests fundamental Qlik set analysis knowledge." },
      { id:7, cat:"Stakeholder", q:"A user reports that clicking a chart in your Qlik Sense app is showing unexpected data in other charts. How do you explain and resolve this?", wtlf:"Explain the associative model (expected behaviour); check if this is intentional (grey = excluded is correct); if truly unexpected, review data model for synthetic keys or incorrect table associations; add bookmark to reset selections; consider using alternate states for comparison. Communication + technical fix." },
      { id:8, cat:"Stakeholder", q:"How would you demo a Qlik Sense dashboard to a business team who have never seen Qlik before?", wtlf:"Start with business question the app answers; demonstrate associative selection (click and see propagation); show how selections guide to insights rather than limit; use storytelling with Qlik Sense stories feature; highlight mobile responsiveness if relevant; end with how to access and bookmark. Engages non-technical audience." },
    ],
    mid: [
      { id:1, cat:"SQL",         q:"You need to load 5 years of daily transactional data (200M rows) into a Qlik Sense app efficiently. What SQL and Qlik loading strategies would you use?", wtlf:"SQL: pre-aggregate in DB to required grain; create summary views/tables. Qlik: incremental QVD load (load only new/changed rows using ModifiedDate watermark); store as QVDs; load summarised QVD into app. Avoid full reload of 200M rows on schedule. Tests performance thinking." },
      { id:2, cat:"SQL",         q:"How would you handle a many-to-many relationship between two tables in Qlik Sense? What are the risks and how do you resolve them?", wtlf:"Many-to-many causes synthetic keys in Qlik (concatenated key auto-created, bad for performance/clarity). Solutions: create a bridge/link table with a concatenated key; use IntervalMatch for range lookups; or resolve at SQL level with an intermediate fact table. Must understand synthetic key risk." },
      { id:3, cat:"Tool",        q:"Explain Qlik Sense's Alternate States feature. Give a practical example of how you would use it for a comparison dashboard.", wtlf:"Alternate States: allow two or more selections simultaneously in the same app for comparison. Example: compare current period vs prior period; assign charts/objects to different states; master items can reference specific states. Use case: A vs B product comparison, region comparison without filtering the whole app." },
      { id:4, cat:"Tool",        q:"What is Section Access in Qlik Sense and how do you implement row-level security for a multi-region sales dashboard?", wtlf:"Section Access: data reduction at app level based on user credentials. ACCESS, USERID, PASSWORD/NTNAME, and reduction field (e.g. REGION) defined in the access section. At load time, Qlik reduces data per user. Publish with 'Reduce data based on section access'. Must stress: publish correctly or all data visible." },
      { id:5, cat:"Analytics",   q:"How would you build a Qlik Sense dashboard to perform customer RFM (Recency, Frequency, Monetary) analysis? Walk through your data model and key expressions.", wtlf:"Data model: transactions table with customer_id, date, amount. Load script: calculate R (days since last purchase), F (count of transactions), M (total spend) per customer. Master measures: RFM scores. Visualisations: scatter plot (R vs F coloured by M), bar charts by segment. Set analysis for segment filtering." },
      { id:6, cat:"Analytics",   q:"Explain the difference between master items (master dimensions and measures) in Qlik Sense and why they are important in an enterprise environment.", wtlf:"Master items: centrally defined, reusable dimensions and measures. Changes propagate to all charts using that master item. Ensures consistency across the app; reduces maintenance; supports governed self-service (analysts use approved measures). Master measures can include complex set analysis, colour coding, and formatting." },
      { id:7, cat:"Stakeholder", q:"You've been asked to migrate 20 QlikView dashboards to Qlik Sense. How do you plan and prioritise this migration?", wtlf:"Audit existing QlikView apps: usage stats (most used first), business criticality, complexity; assess conversion effort (QlikView to Sense converter limitations); prioritise high-use, lower-complexity apps first; plan load script migration (most reusable); stakeholder sign-off at each phase; test with users before decommission." },
      { id:8, cat:"Stakeholder", q:"A business team wants to build their own Qlik Sense app but has no technical background. How do you enable them while maintaining data quality?", wtlf:"Governed self-service model: provide certified QVD data layer they can connect to; training on Sense drag-and-drop; define approved master items they must use; review process before publishing to wider audience; Qlik Sense Business (SaaS) for simpler authoring. Balance enablement with governance." },
    ],
    senior: [
      { id:1, cat:"SQL",         q:"Design a SQL and QVD-based data architecture for a Qlik Sense platform serving 300 concurrent users across 50 apps with sub-3-second load times.", wtlf:"Three-layer QVD architecture: Extract (raw QVDs from source), Transform (business logic QVDs), Load (app-specific QVDs). Pre-aggregate at transform layer; app-level QVDs at the grain needed. Qlik: binary QVD format loads 10-50x faster than SQL. Incremental loads at extract layer. Engine node scaling for concurrency." },
      { id:2, cat:"SQL",         q:"How would you implement a robust incremental load pattern in Qlik Sense for a 500M row fact table that receives inserts, updates, and deletes daily?", wtlf:"Inserts/Updates: watermark on ModifiedDate, load delta QVD, concatenate and deduplicate (keep last by primary key). Deletes: maintain a delete log or full key scan; remove deleted keys from QVD. Store master QVD; reload app from master QVD. Full reload weekly as safety net. Handles all DML operations." },
      { id:3, cat:"Tool",        q:"How would you architect a Qlik Sense enterprise deployment on Qlik Cloud for 2000 users with multi-tenant requirements and data residency constraints?", wtlf:"Qlik Cloud: managed spaces (shared/managed/data); tenant separation per business unit; data gateways for on-premise/private cloud data; spaces-level security and access control; bring-your-own-key encryption for data residency; Qlik AutoML and AI for advanced analytics; API-based automation for governance. Discusses scalability and compliance." },
      { id:4, cat:"Tool",        q:"Explain how Qlik's engine works differently from traditional in-memory BI tools. How does the Associative Engine's memory management work at scale?", wtlf:"Qlik's Associative Engine: columnar in-memory storage; highly compressed (bit-stuffed representation); symbol table + data table separation (efficient for low-cardinality dimensions). At scale: RAM is the bottleneck; engine caches calculations; reload reloads all data. Multi-node: engine nodes handle app sessions. Differs from Tableau: always-loaded vs extract-at-query." },
      { id:5, cat:"Analytics",   q:"How would you use Qlik's APIs (Engine API, Capability API, REST API) to build an automated insight generation pipeline that pushes anomaly alerts to business users?", wtlf:"Engine API (WebSocket): programmatic access to Qlik engine for hypercube data extraction. Schedule via Python/Node.js: extract KPI values, compare to thresholds/baselines, detect anomalies. Push alerts via email/Teams webhook. REST API for app and user management automation. Demonstrates advanced Qlik developer knowledge." },
      { id:6, cat:"Analytics",   q:"Describe how you would implement Qlik's Insight Advisor and AI-assisted analytics in a governed enterprise environment.", wtlf:"Insight Advisor: NLP-based auto-chart generation from master items. Governance: only expose certified master items to Insight Advisor; configure business logic (always/never link certain fields); train via user feedback. AI-generated narratives. Discuss when AI recommendations are reliable vs misleading. Change management for adoption." },
      { id:7, cat:"Stakeholder", q:"You are the Qlik platform owner for a global organisation. How do you build a governance framework that enables 500 self-service authors while maintaining enterprise standards?", wtlf:"Tiered publishing model (personal → shared → managed space with review); certified app standards (naming, master items, documentation); review board for managed space promotion; training and accreditation programme; usage monitoring and app lifecycle management (archive unused apps); data stewardship model. Governance that enables rather than blocks." },
      { id:8, cat:"Stakeholder", q:"Describe the most complex Qlik Sense analytics solution you have delivered. What were the technical and organisational challenges and how did you overcome them?", wtlf:"Looks for: scale and complexity of solution, technical depth (data model, performance, security), stakeholder management at senior level, change management, measurable business outcome, lessons applied. Senior candidates should demonstrate end-to-end ownership and strategic impact beyond technical delivery." },
    ],
  },
};

const STORAGE_KEY = "interview_session_v2";
const saveSession = (data) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {} };
const loadSession = () => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch(e) { return null; } };

const getCatInfo = (role, cat) => role === "analyst" ? ANALYST_CATEGORIES[cat] : ENG_CATEGORIES[cat];

export default function App() {
  const isInterviewer = typeof window !== "undefined" && window.location.search.includes("interviewer=true");

  const [step, setStep]               = useState("setup");
  const [role, setRole]               = useState(null);
  const [platform, setPlatform]       = useState(null);
  const [band, setBand]               = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [yearsExp, setYearsExp]       = useState("");
  const [currentQ, setCurrentQ]       = useState(0);
  const [answers, setAnswers]         = useState({});
  const [scores, setScores]           = useState({});
  const [session, setSession]         = useState(null);

  useEffect(() => {
    if (isInterviewer) { setSession(loadSession()); }
  }, [isInterviewer]);

  const getQuestions = (r, p, b) => {
    if (!r || !p || !b) return [];
    return r === "analyst" ? (ANALYST_QUESTIONS[p]?.[b] || []) : (ENG_QUESTIONS[p]?.[b] || []);
  };

  const questions    = getQuestions(role, platform, band);
  const selectedBand = BANDS.find(b => b.id === band);
  const currentQuestion = questions[currentQ];

  const handleStart = () => {
    if (!role || !platform || !band || !candidateName.trim() || !yearsExp.trim()) return;
    setStep("interview");
    setCurrentQ(0);
    setAnswers({});
  };

  const handleSubmit = () => {
    saveSession({ candidateName, yearsExp, role, platform, band, answers, submittedAt: new Date().toISOString() });
    setStep("thankyou");
  };

  // ─── INTERVIEWER VIEW ─────────────────────────────────────────────────
  if (isInterviewer) {
    if (!session) {
      return (
        <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
          <div style={{ textAlign:"center", color:"#64748b" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
            <h2 style={{ color:"#f1f5f9", fontSize:22, margin:"0 0 8px" }}>No Submission Yet</h2>
            <p style={{ margin:0, fontSize:15 }}>The candidate hasn't completed the interview on this device yet.</p>
          </div>
        </div>
      );
    }
    const qs   = getQuestions(session.role, session.platform, session.band);
    const cats = [...new Set(qs.map(q => q.cat))];
    const catMap = session.role === "analyst" ? ANALYST_CATEGORIES : ENG_CATEGORIES;

    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          {/* Header */}
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:"#94a3b8", fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Interviewer Results</div>
                <h1 style={{ color:"#f1f5f9", fontSize:24, fontWeight:800, margin:"0 0 4px" }}>{session.candidateName}</h1>
                <div style={{ color:"#64748b", fontSize:14 }}>
                  {session.role === "analyst" ? "📊 Data Analyst" : "⚙️ Data Engineer"} · {session.platform} · {BANDS.find(b=>b.id===session.band)?.title}
                  {session.yearsExp && <span> · {session.yearsExp} yrs exp</span>}
                </div>
                <div style={{ color:"#475569", fontSize:12, marginTop:4 }}>Submitted: {new Date(session.submittedAt).toLocaleString()}</div>
              </div>
              <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:12, padding:"1rem 1.5rem", textAlign:"center" }}>
                <div style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Answered</div>
                <div style={{ color:"#f1f5f9", fontSize:32, fontWeight:800 }}>{Object.keys(session.answers).length}<span style={{ color:"#475569", fontSize:16 }}>/{qs.length}</span></div>
              </div>
            </div>
          </div>

          <div style={{ background:"#1e293b", borderLeft:"3px solid #f59e0b", borderRadius:"0 12px 12px 0", padding:"12px 16px", marginBottom:"1.5rem" }}>
            <p style={{ color:"#fcd34d", fontSize:13, margin:0 }}>📋 <strong>Interviewer Mode</strong> — Review answers and score each question 1–4. Results update in real time.</p>
          </div>

          {qs.map((q, i) => {
            const info   = catMap[q.cat] || { color:"#94a3b8", tag: q.cat };
            const answer = session.answers[q.id];
            return (
              <div key={q.id} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ marginBottom:8 }}>
                      <span style={{ background:info.color+"22", color:info.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em", marginRight:8 }}>{info.tag}</span>
                      <span style={{ color:"#475569", fontSize:12 }}>Q{i+1}</span>
                    </div>
                    <p style={{ color:"#e2e8f0", fontSize:15, margin:"0 0 12px", fontWeight:500, lineHeight:1.6 }}>{q.q}</p>
                    <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
                      <div style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Candidate's Answer</div>
                      <p style={{ color: answer ? "#cbd5e1" : "#475569", fontSize:14, margin:0, lineHeight:1.7, fontStyle: answer ? "normal" : "italic" }}>{answer || "No answer provided"}</p>
                    </div>
                    <details>
                      <summary style={{ color:"#64748b", fontSize:13, cursor:"pointer", userSelect:"none" }}>▶ What to Listen For</summary>
                      <div style={{ background:"#0f172a", borderLeft:`3px solid ${info.color}`, borderRadius:"0 8px 8px 0", padding:"10px 14px", marginTop:8 }}>
                        <p style={{ color:"#94a3b8", fontSize:13, margin:0, lineHeight:1.7 }}>{q.wtlf}</p>
                      </div>
                    </details>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, minWidth:52 }}>
                    {[4,3,2,1].map(s => {
                      const cols={4:"#2563eb",3:"#16a34a",2:"#d97706",1:"#dc2626"};
                      const active = scores[q.id]===s;
                      return (
                        <button key={s} onClick={()=>setScores(p=>({...p,[q.id]:s}))}
                          style={{ width:52,height:52,borderRadius:10,border:active?`2px solid ${cols[s]}`:"2px solid #334155",
                            background:active?`${cols[s]}33`:"#0f172a",color:active?cols[s]:"#475569",
                            cursor:"pointer",fontWeight:800,fontSize:18,transition:"all 0.15s" }}>{s}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          {Object.keys(scores).length > 0 && (() => {
            const allVals = Object.values(scores).map(Number);
            const overall = (allVals.reduce((a,b)=>a+b,0)/allVals.length).toFixed(2);
            const anyBelow2 = cats.some(c => {
              const vals = qs.filter(q=>q.cat===c).map(q=>scores[q.id]).filter(Boolean);
              return vals.length && (vals.reduce((a,b)=>a+b,0)/vals.length) < 2;
            });
            const verdict = parseFloat(overall)>=3.0&&!anyBelow2
              ?{text:"RECOMMENDED TO PROCEED",color:"#16a34a",bg:"#f0fdf4"}
              :parseFloat(overall)>=2.5
              ?{text:"BORDERLINE — REVIEW CAREFULLY",color:"#d97706",bg:"#fffbeb"}
              :{text:"NOT RECOMMENDED AT THIS LEVEL",color:"#dc2626",bg:"#fef2f2"};
            return (
              <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.5rem", marginTop:"1.5rem" }}>
                <h3 style={{ color:"#f1f5f9", fontSize:18, fontWeight:700, margin:"0 0 1rem" }}>Score Summary</h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:"1rem" }}>
                  {cats.map(cat => {
                    const vals = qs.filter(q=>q.cat===cat).map(q=>scores[q.id]).filter(Boolean);
                    const avg  = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
                    const info = catMap[cat] || {color:"#94a3b8",tag:cat};
                    return (
                      <div key={cat} style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"12px 14px" }}>
                        <div style={{ color:info.color, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{info.tag}</div>
                        <div style={{ color:"#f1f5f9", fontSize:26, fontWeight:800 }}>{avg??'—'}<span style={{ color:"#475569",fontSize:13 }}>/4</span></div>
                        {avg && parseFloat(avg)<2 && <div style={{ color:"#dc2626",fontSize:11,marginTop:2 }}>⚠ Below minimum</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:verdict.bg, border:`2px solid ${verdict.color}40`, borderRadius:12, padding:"1.25rem", textAlign:"center" }}>
                  <div style={{ fontSize:32, fontWeight:800, color:verdict.color }}>{overall}<span style={{ fontSize:16, color:"#94a3b8" }}>/4</span></div>
                  <div style={{ color:verdict.color, fontWeight:700, fontSize:13, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:4 }}>{verdict.text}</div>
                  <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>Min 3.0 avg · No category below 2.0</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // ─── THANK YOU ────────────────────────────────────────────────────────
  if (step === "thankyou") {
    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ maxWidth:480, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:64, marginBottom:24 }}>✅</div>
          <h1 style={{ color:"#f1f5f9", fontSize:28, fontWeight:800, margin:"0 0 12px" }}>Thank You, {candidateName}!</h1>
          <p style={{ color:"#64748b", fontSize:16, lineHeight:1.7, margin:"0 0 24px" }}>Your answers have been successfully submitted. The interviewer will review your responses shortly.</p>
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"1.25rem" }}>
            <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>📬 Your submission has been recorded.<br/>You may now close this window.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── SETUP ────────────────────────────────────────────────────────────
  if (step === "setup") {
    const platformOptions = role === "analyst" ? TOOLS_ANALYST : PLATFORMS_ENG;
    const platformIcons   = { Azure:"☁️", AWS:"⚡", Snowflake:"❄️", "Power BI":"📊", "Tableau":"📈", "Qlik Sense":"🔵" };
    const canStart = role && platform && band && candidateName.trim() && yearsExp.trim();

    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:540 }}>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"6px 14px", marginBottom:16 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 6px #22c55e" }}></span>
              <span style={{ color:"#94a3b8", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase" }}>Technical Interview</span>
            </div>
            <h1 style={{ color:"#f1f5f9", fontSize:26, fontWeight:800, margin:"0 0 8px" }}>Welcome</h1>
            <p style={{ color:"#64748b", fontSize:14, margin:0 }}>Please fill in your details to begin</p>
          </div>

          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"2rem", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
            {/* Name */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Full Name *</label>
              <input placeholder="e.g. Alex Johnson" value={candidateName} onChange={e=>setCandidateName(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            {/* Years */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Years of Experience *</label>
              <input placeholder="e.g. 4" type="number" min="0" max="40" value={yearsExp} onChange={e=>setYearsExp(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            {/* Role */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>Role *</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {ROLES.map(r => {
                  const active = role === r.id;
                  return (
                    <button key={r.id} onClick={()=>{ setRole(r.id); setPlatform(null); }}
                      style={{ padding:"14px 10px", borderRadius:10, border:active?"2px solid #3b82f6":"2px solid #334155",
                        background:active?"#1d3a5e":"#0f172a", color:active?"#93c5fd":"#64748b",
                        cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:6, textAlign:"center" }}>
                      <span style={{ fontSize:24 }}>{r.icon}</span>
                      <span style={{ color:active?"#e2e8f0":"#94a3b8", fontWeight:700 }}>{r.label}</span>
                      <span style={{ color:"#475569", fontSize:11 }}>{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform / Tool */}
            {role && (
              <div>
                <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>
                  {role === "analyst" ? "Analytics Tool *" : "Cloud Platform *"}
                </label>
                <div style={{ display:"grid", gridTemplateColumns: role==="analyst" ? "1fr 1fr 1fr" : "1fr 1fr 1fr", gap:10 }}>
                  {platformOptions.map(p => {
                    const active = platform === p;
                    return (
                      <button key={p} onClick={()=>setPlatform(p)}
                        style={{ padding:"14px 8px", borderRadius:10, border:active?"2px solid #3b82f6":"2px solid #334155",
                          background:active?"#1d3a5e":"#0f172a", color:active?"#93c5fd":"#64748b",
                          cursor:"pointer", fontSize:12, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:22 }}>{platformIcons[p]}</span>
                        <span style={{ fontSize:11 }}>{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Band */}
            {role && platform && (
              <div>
                <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>Experience Band *</label>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {BANDS.map(b => {
                    const active = band === b.id;
                    return (
                      <button key={b.id} onClick={()=>setBand(b.id)}
                        style={{ padding:"12px 16px", borderRadius:10, border:active?`2px solid ${b.color}`:"2px solid #334155",
                          background:"#0f172a", color:active?"#f1f5f9":"#64748b",
                          cursor:"pointer", fontSize:14, fontWeight:500, display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                        <span style={{ fontSize:18 }}>{b.emoji}</span>
                        <span>
                          <span style={{ color:active?b.color:"#64748b", fontWeight:700 }}>{b.label}</span>
                          <span style={{ color:"#475569", marginLeft:8, fontSize:12 }}>{b.title}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={handleStart} disabled={!canStart}
              style={{ padding:"14px", borderRadius:10, border:"none",
                background:canStart?"linear-gradient(135deg,#3b82f6,#2563eb)":"#1e293b",
                color:canStart?"#fff":"#475569", cursor:canStart?"pointer":"not-allowed",
                fontSize:15, fontWeight:700, boxShadow:canStart?"0 4px 20px rgba(59,130,246,0.3)":"none",
                transition:"all 0.2s" }}>
              {canStart ? `Begin Interview →` : "Complete all fields above"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── INTERVIEW ────────────────────────────────────────────────────────
  const catInfo   = getCatInfo(role, currentQuestion?.cat);
  const allAnswered = questions.every(q => answers[q.id]?.trim());

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      {/* Top bar */}
      <div style={{ background:"#1e293b", borderBottom:"1px solid #334155", padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <span style={{ color:"#f1f5f9", fontWeight:700 }}>{candidateName}</span>
          <span style={{ color:"#475569", margin:"0 8px" }}>·</span>
          <span style={{ color:"#64748b", fontSize:14 }}>{platform} · {selectedBand?.title}</span>
        </div>
        <span style={{ color:"#64748b", fontSize:13 }}>Q{currentQ+1} of {questions.length}</span>
      </div>

      {/* Progress */}
      <div style={{ height:3, background:"#1e293b" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#3b82f6,#8b5cf6)", width:`${(currentQ/questions.length)*100}%`, transition:"width 0.3s" }} />
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"2rem" }}>
        <div style={{ marginBottom:"1.25rem" }}>
          <span style={{ background:catInfo?.color+"22", color:catInfo?.color, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {catInfo?.tag}
          </span>
          <span style={{ color:"#475569", fontSize:13, marginLeft:10 }}>Question {currentQ+1}</span>
        </div>

        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.75rem", marginBottom:"1.25rem" }}>
          <p style={{ color:"#e2e8f0", fontSize:18, lineHeight:1.7, margin:0, fontWeight:500 }}>{currentQuestion?.q}</p>
        </div>

        <div style={{ marginBottom:"1.5rem" }}>
          <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Your Answer</label>
          <textarea value={answers[currentQuestion?.id]||""} onChange={e=>setAnswers(p=>({...p,[currentQuestion.id]:e.target.value}))}
            placeholder="Type your answer here..." rows={6}
            style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"14px 16px",
              color:"#e2e8f0", fontSize:15, lineHeight:1.6, resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
          <button onClick={()=>setCurrentQ(q=>Math.max(0,q-1))} disabled={currentQ===0}
            style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid #334155", background:"#1e293b",
              color:currentQ===0?"#334155":"#94a3b8", cursor:currentQ===0?"not-allowed":"pointer", fontSize:14, fontWeight:600 }}>
            ← Previous
          </button>
          {currentQ < questions.length-1 ? (
            <button onClick={()=>setCurrentQ(q=>q+1)}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#3b82f6,#2563eb)",
                color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700, boxShadow:"0 4px 14px rgba(59,130,246,0.3)" }}>
              Next Question →
            </button>
          ) : (
            <button onClick={handleSubmit}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"none",
                background:allAnswered?"linear-gradient(135deg,#22c55e,#16a34a)":"linear-gradient(135deg,#3b82f6,#2563eb)",
                color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700,
                boxShadow:`0 4px 14px ${allAnswered?"rgba(34,197,94,0.3)":"rgba(59,130,246,0.3)"}` }}>
              {allAnswered?"Submit Answers ✓":"Submit Answers →"}
            </button>
          )}
        </div>

        {/* Dot nav */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:"1.5rem", flexWrap:"wrap" }}>
          {questions.map((q,i) => (
            <button key={q.id} onClick={()=>setCurrentQ(i)}
              style={{ width:28, height:28, borderRadius:"50%", border:i===currentQ?"2px solid #3b82f6":"2px solid #334155",
                background:answers[q.id]?.trim()?"#22c55e33":(i===currentQ?"#1d3a5e":"#0f172a"),
                color:i===currentQ?"#3b82f6":answers[q.id]?.trim()?"#22c55e":"#475569",
                cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {i+1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
