import { useState, useEffect, useRef } from "react";

const PLATFORMS = ["Azure", "AWS", "Snowflake"];

const BANDS = [
  { id: "junior", label: "0–3 Years", color: "#22c55e", emoji: "🟢", title: "Junior / Entry Level" },
  { id: "mid", label: "3–5 Years", color: "#f97316", emoji: "🟠", title: "Mid-Level" },
  { id: "senior", label: "5+ Years", color: "#a855f7", emoji: "🟣", title: "Senior / Lead" },
];

const CATEGORIES = {
  SQL: { color: "#3b82f6", bg: "#eff6ff" },
  Cloud: { color: "#0ea5e9", bg: "#f0f9ff" },
  Python: { color: "#8b5cf6", bg: "#f5f3ff" },
  Stakeholder: { color: "#ec4899", bg: "#fdf2f8" },
};

const QUESTIONS = {
  Azure: {
    junior: [
      { id: 1, cat: "SQL", q: "Write a SQL query to find the top 5 customers by total order value from a table called 'orders' with columns customer_id, order_date, and order_amount.", wtlf: "SELECT customer_id, SUM(order_amount) AS total FROM orders GROUP BY customer_id ORDER BY total DESC OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY (or TOP 5). Checks GROUP BY, aggregation, ordering." },
      { id: 2, cat: "SQL", q: "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with a simple example.", wtlf: "Should clearly distinguish: INNER = matching rows only; LEFT = all left rows + matching right; FULL OUTER = all rows from both sides. Bonus: demonstrates with an example." },
      { id: 3, cat: "Cloud", q: "What is Azure Data Factory (ADF) and how would you use it to move data from an on-premise SQL Server to Azure Data Lake Storage?", wtlf: "Expects: ADF as ETL orchestration tool; use of Integration Runtime (Self-Hosted IR) to bridge on-premise; source/sink linked services; pipeline + copy activity configuration." },
      { id: 4, cat: "Cloud", q: "What is the difference between Azure Data Lake Storage Gen2 and Azure Blob Storage?", wtlf: "ADLS Gen2: hierarchical namespace, ACL-based security, optimised for big data analytics. Blob: flat namespace, better for unstructured object storage. ADLS Gen2 built on Blob with extra capabilities." },
      { id: 5, cat: "Python", q: "Write a simple Python script to read a CSV file from a local path and load it into a Pandas DataFrame, then print the first 5 rows.", wtlf: "Expects: import pandas as pd; pd.read_csv('file.csv'); df.head(). Tests basic Pandas knowledge and file I/O." },
      { id: 6, cat: "Python", q: "What are Python virtual environments and why are they important in a data engineering project?", wtlf: "Expects: isolated dependency management (venv/conda), prevents version conflicts, reproducible environments. Bonus: mention requirements.txt or Poetry." },
      { id: 7, cat: "Stakeholder", q: "A business analyst sends you an urgent request for a data report by end of day, but you're already committed to another critical pipeline fix. How do you handle this?", wtlf: "Good answer: communicates proactively, assesses priority with both parties, proposes a realistic timeline, does not silently drop either task. Red flags: over-promising or ignoring one stakeholder." },
      { id: 8, cat: "Stakeholder", q: "How would you explain to a non-technical stakeholder why a data pipeline failed and what your remediation plan is?", wtlf: "Expects: plain language (no jargon), clear root cause summary, concrete fix and timeline, reassurance of monitoring. Tests communication adaptability." },
    ],
    mid: [
      { id: 1, cat: "SQL", q: "You have a slowly growing dimension table (SCD). Write a SQL MERGE statement to upsert changes from a staging table into the dimension table.", wtlf: "Expects proper MERGE syntax: USING staging ON key match; WHEN MATCHED THEN UPDATE; WHEN NOT MATCHED THEN INSERT. Bonus: handle SCD Type 2 with effective dates." },
      { id: 2, cat: "SQL", q: "Explain query execution plans in Azure Synapse Analytics. How would you identify and resolve a data skew issue?", wtlf: "Expects: reading execution plans; data skew = uneven distribution across distributions; solutions: hash distribution key change, ROUND_ROBIN, statistics update, CTAS to redistribute." },
      { id: 3, cat: "Cloud", q: "Describe how you would design a medallion architecture (Bronze/Silver/Gold) in Azure Data Lake using Azure Databricks.", wtlf: "Bronze: raw ingestion; Silver: cleansed/deduplicated; Gold: aggregated/business-ready. Should mention Delta Lake format, partitioning strategy, and Databricks notebooks/jobs." },
      { id: 4, cat: "Cloud", q: "What is Azure Synapse Analytics? How does it differ from Azure Databricks, and when would you use each?", wtlf: "Synapse: integrated analytics with dedicated SQL pools + Spark. Databricks: advanced ML/Spark workloads, better for data science collaboration. Choice depends on SQL-heavy vs ML-heavy workloads." },
      { id: 5, cat: "Python", q: "How would you use the azure-storage-blob Python SDK to upload a Pandas DataFrame as a Parquet file to ADLS Gen2?", wtlf: "Expects: df.to_parquet() with BytesIO buffer; BlobServiceClient with connection string or credential; upload_blob(). Bonus: use DefaultAzureCredential." },
      { id: 6, cat: "Python", q: "Explain PySpark DataFrames vs Pandas DataFrames. When would you choose one over the other in an Azure Databricks environment?", wtlf: "PySpark: distributed, handles TB-scale; lazy evaluation. Pandas: in-memory, single node, rich ecosystem. Pandas for small datasets/ML prep; PySpark for large distributed processing." },
      { id: 7, cat: "Stakeholder", q: "A downstream team claims your pipeline is producing incorrect numbers that differ from their legacy system. How do you investigate and communicate your findings?", wtlf: "Good answer: data reconciliation process, cross-checks with source, documents findings with evidence, aligns on definition of 'correct', involves both teams in resolution. Avoids blame." },
      { id: 8, cat: "Stakeholder", q: "You've identified a critical architectural improvement that requires 2 weeks of rework. How do you build a business case and get stakeholder buy-in?", wtlf: "Expects: quantifying technical debt impact (downtime, maintenance hours), translating to business cost, proposing phased delivery, risk framing, clear ROI. Tests influence without authority." },
    ],
    senior: [
      { id: 1, cat: "SQL", q: "Design a SQL strategy for handling late-arriving data in a fact table in Azure Synapse Analytics. How do you ensure idempotency?", wtlf: "Expects: staging + MERGE pattern; watermark columns; UPSERT logic; partitioning on date; hash distribution for upsert target. Idempotency: re-runnable pipelines that don't double-count." },
      { id: 2, cat: "SQL", q: "How would you optimise a complex multi-join query in Synapse Dedicated SQL Pool that is causing tempdb spill and high execution time?", wtlf: "Expects: statistics update, distribution key alignment (hash on join key), CCI (Clustered Columnstore Index), partition elimination, materialised views, reduce data movement steps in plan." },
      { id: 3, cat: "Cloud", q: "Design a real-time streaming data pipeline on Azure for IoT sensor data landing in Event Hubs, processing in Stream Analytics, and serving via Synapse. Include error handling.", wtlf: "Expects: Event Hubs → Stream Analytics (windowing functions) → ADLS/Synapse; dead-letter queue for poison messages; alerting via Azure Monitor; schema evolution strategy." },
      { id: 4, cat: "Cloud", q: "How do you implement data governance and lineage tracking in an Azure data platform at enterprise scale? Reference specific Azure tools.", wtlf: "Expects: Microsoft Purview for cataloguing/lineage; Unity Catalog if Databricks; role-based access via Entra ID; sensitivity labels; audit logging in Diagnostic Settings." },
      { id: 5, cat: "Python", q: "How would you implement a robust, retry-enabled data ingestion framework in Python for Azure, handling transient failures and partial loads?", wtlf: "Expects: exponential backoff with tenacity or custom retry; checkpointing state (e.g., in Azure Table Storage); idempotent writes; structured logging; alerting on permanent failure." },
      { id: 6, cat: "Python", q: "Describe how you would use Python and Delta Lake APIs in Databricks to implement SCD Type 2 at scale with MERGE INTO.", wtlf: "Expects: DeltaTable.forName().merge() API; match on business key + is_current flag; WHEN MATCHED update current=False, end_date; WHEN NOT MATCHED insert new row. Partition optimisation." },
      { id: 7, cat: "Stakeholder", q: "You're leading a platform migration project. A key business stakeholder keeps requesting scope changes mid-sprint, delaying delivery. How do you manage this?", wtlf: "Expects: formal change request process, impact assessment (time/cost/risk), escalation path if needed, keeping stakeholder engaged while protecting delivery commitments. Firm but collaborative." },
      { id: 8, cat: "Stakeholder", q: "Describe a time you had to mediate a disagreement between two teams (e.g., data engineering vs. data science) about data ownership or quality standards.", wtlf: "Looks for: structured conflict resolution, data ownership matrix (RACI), facilitating alignment on shared standards, executive escalation only when needed. Evidence of maturity and leadership." },
    ],
  },
  AWS: {
    junior: [
      { id: 1, cat: "SQL", q: "Write a SQL query to calculate the 7-day rolling average of daily sales from a table 'daily_sales' with columns sale_date and total_sales.", wtlf: "Expects: AVG(total_sales) OVER (ORDER BY sale_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). Tests window function knowledge." },
      { id: 2, cat: "SQL", q: "What is the difference between WHERE and HAVING clauses in SQL? Give an example where HAVING is necessary.", wtlf: "WHERE filters before aggregation; HAVING filters after. Example: sales > 1000 in WHERE vs total per group in HAVING. Should show correct usage." },
      { id: 3, cat: "Cloud", q: "What is Amazon S3 and how would you use it as a data lake foundation? What are S3 storage classes?", wtlf: "Expects: S3 as object storage; bucket/prefix structure for data lake; storage classes: Standard, IA, Glacier for cost tiering; versioning and lifecycle policies." },
      { id: 4, cat: "Cloud", q: "Explain the difference between AWS Glue and AWS Lambda for data processing tasks.", wtlf: "Glue: managed ETL, Spark-based, for large batch transformations, has Data Catalog. Lambda: serverless functions, event-driven, for lightweight/trigger-based tasks. Not interchangeable." },
      { id: 5, cat: "Python", q: "Write a Python function to connect to Amazon S3 using boto3 and list all files in a given bucket prefix.", wtlf: "Expects: import boto3; s3 = boto3.client('s3'); s3.list_objects_v2(Bucket=..., Prefix=...). Handles pagination as a bonus." },
      { id: 6, cat: "Python", q: "What is the difference between Python's list, tuple, and dictionary? Give data engineering use cases for each.", wtlf: "List: ordered mutable (column values); Tuple: immutable (schema definition, config keys); Dict: key-value (row mapping, config dicts, JSON records). Demonstrates practical grounding." },
      { id: 7, cat: "Stakeholder", q: "Your manager asks for a dashboard by Friday but you discover the source data is missing for two of the five required metrics. What do you do?", wtlf: "Good: immediately surfaces the gap, quantifies what IS deliverable, proposes interim solution (partial dashboard with caveats), does not hide the problem until Friday." },
      { id: 8, cat: "Stakeholder", q: "How do you keep stakeholders informed about the progress of a long-running data migration project?", wtlf: "Expects: regular status cadence, milestone tracking, risk flagging early, single source of truth (JIRA/Confluence), escalation thresholds defined upfront. Tests proactive communication." },
    ],
    mid: [
      { id: 1, cat: "SQL", q: "Write a SQL query using window functions to rank employees within each department by salary and return only rank 1 and 2 per department.", wtlf: "Expects: DENSE_RANK() or RANK() OVER (PARTITION BY dept ORDER BY salary DESC); filter WHERE rank <= 2. Tests partitioning and filtering on window results." },
      { id: 2, cat: "SQL", q: "How do you handle NULL values in aggregate functions and JOIN conditions in SQL? Why does this matter in data engineering?", wtlf: "NULLs ignored in aggregates (use COALESCE/NULLIF); NULLs never equal in JOINs (use IS NULL). Data engineers must handle NULLs explicitly to prevent silent data loss." },
      { id: 3, cat: "Cloud", q: "Describe how you would build a serverless ETL pipeline using AWS Glue, S3, and Athena to process daily JSON files.", wtlf: "Expects: S3 trigger → Glue Crawler to update catalog → Glue Job (PySpark/Python Shell) to transform → Parquet output to S3 → Athena for querying. Partition strategy included." },
      { id: 4, cat: "Cloud", q: "What is AWS Redshift Spectrum and how does it differ from querying data in a Redshift cluster?", wtlf: "Spectrum: queries S3 data directly via external tables without loading into cluster; uses Redshift query engine but scales independently. Good for cold/archival data or data lake federation." },
      { id: 5, cat: "Python", q: "How do you use PySpark in AWS Glue to read a partitioned Parquet dataset from S3, filter records, and write back to a different S3 location?", wtlf: "Expects: GlueContext or SparkContext; spark.read.parquet('s3://...'); .filter(); .write.mode('overwrite').parquet('s3://...'); partition pruning with pushdown predicates." },
      { id: 6, cat: "Python", q: "Explain Python decorators and give a practical data engineering example of when you'd write one.", wtlf: "Decorator = function wrapper; use cases: retry logic, logging, timing, circuit breakers for API calls. Shows intermediate Python proficiency beyond basic scripting." },
      { id: 7, cat: "Stakeholder", q: "A data science team is frustrated that your pipelines deliver data too slowly for their ML model retraining schedule. How do you work with them to resolve this?", wtlf: "Expects: SLA discussion, root cause analysis (batch vs stream, schedule times), incremental loading option, aligning on acceptable latency, formalising an SLA agreement." },
      { id: 8, cat: "Stakeholder", q: "How do you manage competing priorities between the infrastructure team (wanting stability) and analytics teams (wanting new features quickly)?", wtlf: "Good: product-style backlog prioritisation, risk/benefit framing, staging environment for new features, regular joint ceremonies. Shows systems thinking and diplomacy." },
    ],
    senior: [
      { id: 1, cat: "SQL", q: "How would you implement incremental data loading in Redshift using watermark-based change detection? Address schema evolution.", wtlf: "Expects: MAX(updated_at) watermark in control table; incremental COPY or MERGE; schema evolution handled with ALTER TABLE ADD COLUMN or SUPER type; backward compatibility." },
      { id: 2, cat: "SQL", q: "Explain distribution keys and sort keys in Amazon Redshift. How do poor choices affect query performance, and how would you diagnose this?", wtlf: "Distribution keys: co-locate join data; wrong choice = data movement. Sort keys: zone maps for range scans. Diagnosis: STL_EXPLAIN, SVV_TABLE_INFO, ANALYZE COMPRESSION, VACUUM usage." },
      { id: 3, cat: "Cloud", q: "Design a cost-optimised, fault-tolerant data lakehouse on AWS for petabyte-scale analytics. Walk through your architecture choices.", wtlf: "Expects: S3 (storage), Glue Catalog, Iceberg/Delta for ACID, Athena/Redshift Spectrum for ad-hoc, EMR or Glue for processing, Kinesis for streaming, Lake Formation for governance, right-sizing and lifecycle policies." },
      { id: 4, cat: "Cloud", q: "How would you implement data quality monitoring and alerting in an AWS data platform at scale? Reference specific services.", wtlf: "Expects: AWS Glue DataBrew or custom Great Expectations; results stored in S3/DynamoDB; CloudWatch metrics + alarms; SNS notifications; quarantine bucket for bad records." },
      { id: 5, cat: "Python", q: "How would you design a Python-based framework for orchestrating complex, dependency-aware ETL jobs on AWS Step Functions?", wtlf: "Expects: Step Functions state machine definition in JSON/CDK; Lambda/ECS tasks; error catching and retry states; parallel branches; idempotency tokens; logging to CloudWatch." },
      { id: 6, cat: "Python", q: "Describe your approach to unit testing and integration testing PySpark jobs deployed on AWS Glue or EMR.", wtlf: "Expects: pyspark local mode for unit tests; mocking S3 with moto; pytest fixtures; integration tests against dev environment; CI/CD pipeline (CodePipeline/GitHub Actions) with test gates." },
      { id: 7, cat: "Stakeholder", q: "You discover that a data product your team owns is being used in a critical regulatory report you were never informed about. How do you handle this?", wtlf: "Good: data discovery process gap identified; immediate impact assessment; formalise SLA for that dataset; work with governance team to document; improve data catalog ownership tagging." },
      { id: 8, cat: "Stakeholder", q: "As a senior engineer, how do you mentor junior engineers while managing your own delivery commitments and stakeholder expectations?", wtlf: "Expects: structured pairing/code reviews, delegating with clear ownership, setting boundaries on availability, tracking team capacity, shielding juniors from noise while keeping them growing." },
    ],
  },
  Snowflake: {
    junior: [
      { id: 1, cat: "SQL", q: "Write a SQL query in Snowflake to count the number of orders per customer per month, using date_trunc.", wtlf: "Expects: DATE_TRUNC('month', order_date) AS month; GROUP BY customer_id, month; COUNT(*). Tests Snowflake date functions and aggregation." },
      { id: 2, cat: "SQL", q: "Explain the difference between a CTE (WITH clause) and a subquery. When would you prefer one over the other?", wtlf: "CTE: readable, reusable in same query, better for recursive logic. Subquery: inline, sometimes optimised differently. CTEs preferred for readability and multi-reference scenarios." },
      { id: 3, cat: "Cloud", q: "What is a Snowflake Virtual Warehouse and how does auto-suspend/auto-resume help control costs?", wtlf: "Virtual Warehouse = compute cluster (XS to 6XL). Auto-suspend stops billing when idle; auto-resume starts on query. Separates compute from storage, key Snowflake differentiator." },
      { id: 4, cat: "Cloud", q: "What are Snowflake stages? What is the difference between an internal stage and an external stage?", wtlf: "Internal: Snowflake-managed storage (user/table/named); External: points to S3/ADLS/GCS. Used with COPY INTO for bulk loading. Named stages are reusable." },
      { id: 5, cat: "Python", q: "How would you use the Snowflake Python Connector to execute a query and fetch results into a Pandas DataFrame?", wtlf: "Expects: snowflake.connector.connect(...); cursor.execute('SELECT...'); fetch_pandas_all() or fetchall() + pd.DataFrame(). Bonus: use SnowflakeConnection as context manager." },
      { id: 6, cat: "Python", q: "What is a Python generator and how might you use one when processing large result sets from Snowflake?", wtlf: "Generator: yields one row at a time, memory efficient. Use case: iterating cursor.fetchone() or chunked fetchmany() instead of loading all rows into memory at once." },
      { id: 7, cat: "Stakeholder", q: "A business user says 'the numbers look wrong' in a report you built. How do you approach this conversation and investigation?", wtlf: "Good: takes concern seriously without defensiveness, asks for specifics (which metric, date range), traces back to source, documents findings, communicates ETA for resolution." },
      { id: 8, cat: "Stakeholder", q: "You are new to a team. How would you identify and build relationships with key stakeholders in your first 30 days?", wtlf: "Expects: stakeholder mapping, scheduling 1:1 introductions, understanding their data needs, identifying pain points, reviewing existing documentation. Shows initiative and EQ." },
    ],
    mid: [
      { id: 1, cat: "SQL", q: "Write a Snowflake SQL query to detect duplicate records in a table using ROW_NUMBER(), and delete all but the most recent entry.", wtlf: "Expects: ROW_NUMBER() OVER (PARTITION BY key_cols ORDER BY updated_at DESC); DELETE WHERE row_num > 1 via CTE or subquery. Tests deduplication pattern." },
      { id: 2, cat: "SQL", q: "Explain Snowflake's FLATTEN function and VARIANT type. When would you use them?", wtlf: "VARIANT: semi-structured JSON/XML/Avro storage. FLATTEN: lateral explodes arrays within VARIANT into rows. Used for parsing nested JSON payloads from APIs or event streams." },
      { id: 3, cat: "Cloud", q: "What is Snowpipe and how does it enable continuous, near-real-time data ingestion into Snowflake?", wtlf: "Snowpipe: serverless, event-triggered COPY INTO; uses S3/Azure/GCS event notifications; micro-batch loading within seconds; billed per credit usage not warehouse time." },
      { id: 4, cat: "Cloud", q: "Explain Snowflake's Time Travel and Fail-Safe features. How would you use them in a data engineering context?", wtlf: "Time Travel: query/restore historical data up to 90 days (Standard 1 day). Fail-Safe: 7-day disaster recovery by Snowflake support. Use for accidental deletes, debugging, and audit." },
      { id: 5, cat: "Python", q: "How would you use the Snowflake dbt (data build tool) Python models to transform data in Snowflake? What are the advantages over SQL models?", wtlf: "Python dbt models: run as Snowpark stored procs; useful for ML-like transformations, Pandas ops, external library integration. SQL models preferred for pure SQL logic; Python for procedural logic." },
      { id: 6, cat: "Python", q: "How do you use Snowpark for Python to process data directly in Snowflake without extracting it? Give a transformation example.", wtlf: "Expects: snowpark Session; session.table(); DataFrame.filter/groupBy/agg; lazy evaluation pushed to Snowflake engine; write back with .save_as_table(). Avoids data movement." },
      { id: 7, cat: "Stakeholder", q: "Mid-project, you learn that the data model you built doesn't meet new compliance requirements. How do you communicate this and re-plan?", wtlf: "Good: immediate notification to project lead, impact scope assessment, propose minimal-change remediation, realistic revised timeline, document decision log, no finger-pointing." },
      { id: 8, cat: "Stakeholder", q: "How do you handle a situation where two business teams want the same metric defined differently in your data model?", wtlf: "Expects: facilitates alignment meeting, documents both definitions, builds separate agreed metrics if genuinely different business contexts, prevents 'two versions of truth', updates data dictionary." },
    ],
    senior: [
      { id: 1, cat: "SQL", q: "How would you design and implement a slowly changing dimension (SCD Type 2) in Snowflake using MERGE and streams?", wtlf: "Expects: Snowflake Stream on source table for CDC; MERGE INTO dimension with WHEN MATCHED (close old row, insert new) and WHEN NOT MATCHED (insert); effective_from / is_current columns." },
      { id: 2, cat: "SQL", q: "What are Snowflake Dynamic Tables and how do they simplify incremental transformation pipelines compared to traditional scheduled tasks?", wtlf: "Dynamic Tables: declarative, auto-refreshed materialised views with lag targets; replaces task+stream+MERGE pattern for many use cases; Snowflake manages refresh frequency automatically." },
      { id: 3, cat: "Cloud", q: "Design a cost governance strategy for a large Snowflake deployment with multiple teams and use cases. What controls and monitoring would you implement?", wtlf: "Expects: resource monitors per warehouse/role; Query Tags for attribution; ACCOUNT_USAGE views for cost dashboards; dedicated warehouses per workload type; credits budgeting; auto-suspend tuning." },
      { id: 4, cat: "Cloud", q: "How would you architect a multi-cloud, multi-region data sharing strategy using Snowflake Secure Data Sharing and Data Clean Rooms?", wtlf: "Expects: Snowflake Data Sharing (no data movement, read-only share object); Data Marketplace; Data Clean Rooms for privacy-preserving joins; replication for cross-region; governance via row access policies." },
      { id: 5, cat: "Python", q: "How would you build a CI/CD pipeline for Snowflake dbt models using Python tooling, including automated testing and deployment across environments?", wtlf: "Expects: dbt CLI in GitHub Actions/GitLab CI; dbt test for schema/data quality; dev→staging→prod promotion; Snowflake secrets in vault/CI env vars; Slim CI (dbt state:modified)." },
      { id: 6, cat: "Python", q: "Describe how Snowpark Machine Learning enables in-database model training. When is this preferable to training models outside Snowflake?", wtlf: "Snowpark ML: trains sklearn/XGBoost models inside Snowflake using Snowpark DataFrames; no data egress; model registry in Snowflake. Preferred when data is large, sensitive, or egress is costly." },
      { id: 7, cat: "Stakeholder", q: "You're presenting a proposal to migrate from a legacy on-premise data warehouse to Snowflake to the executive leadership team. How do you structure your case?", wtlf: "Expects: business outcome focus (cost, speed, scalability), not technical specs; ROI analysis; risk mitigation plan; phased approach; reference to similar migrations; handles pushback confidently." },
      { id: 8, cat: "Stakeholder", q: "How do you establish and maintain data SLAs with business stakeholders, and what happens when you breach one?", wtlf: "Expects: upfront SLA definition (freshness, accuracy, availability); monitoring dashboards; breach notification protocol; post-mortem process; continuous improvement culture, not blame." },
    ],
  },
};

const SCORING_RUBRIC = [
  { score: "4 – Exceptional", tech: "Deep understanding, proactively covers edge cases, offers alternatives", stakeholder: "Structured, empathetic, business-outcome focused. Drives resolution", signal: "Strong hire, above level expectations" },
  { score: "3 – Proficient", tech: "Correct answer with clear understanding, minor gaps in edge cases", stakeholder: "Handles situation well, communicates clearly, considers all parties", signal: "Good hire, meets level requirements" },
  { score: "2 – Developing", tech: "Partially correct, misses key concepts, needs prompting", stakeholder: "Reactive rather than proactive, some gaps in communication strategy", signal: "Possible hire with coaching plan" },
  { score: "1 – Insufficient", tech: "Incorrect or very limited understanding, cannot self-correct with hints", stakeholder: "Avoidance, blame, or poor communication; lacks stakeholder awareness", signal: "Do not hire at this level" },
];

const catLabel = (cat) => {
  if (cat === "Cloud") return "Cloud Technology";
  if (cat === "Stakeholder") return "Stakeholder Mgmt";
  return cat;
};

export default function App() {
  const [step, setStep] = useState("setup"); // setup | interview | results
  const [platform, setPlatform] = useState(null);
  const [band, setBand] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [showWTLF, setShowWTLF] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loadingFeedback, setLoadingFeedback] = useState({});
  const textareaRefs = useRef({});

  const questions = platform && band ? QUESTIONS[platform][band] : [];
  const currentQuestion = questions[currentQ];

  const handleStart = () => {
    if (!platform || !band) return;
    setStep("interview");
    setCurrentQ(0);
    setAnswers({});
    setScores({});
    setFeedback({});
    setShowWTLF({});
  };

  const handleScore = (qId, s) => {
    setScores((prev) => ({ ...prev, [qId]: s }));
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const toggleWTLF = (qId) => {
    setShowWTLF((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const getFeedback = async (q) => {
    const answer = answers[q.id] || "";
    if (!answer.trim()) return;
    setLoadingFeedback((prev) => ({ ...prev, [q.id]: true }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert technical interviewer evaluating Data Engineer candidates. 
You will be given an interview question, the expected answer guide (what to listen for), and the candidate's answer.
Provide brief, sharp feedback in 2-3 sentences: what they got right, what's missing, and a suggested score (1-4).
Be direct and professional. Format: Start with a score recommendation like "Score: X/4 — " then the feedback.`,
          messages: [
            {
              role: "user",
              content: `Question: ${q.q}\n\nExpected signals: ${q.wtlf}\n\nCandidate's answer: ${answer}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data.content?.find((b) => b.type === "text")?.text || "";
      setFeedback((prev) => ({ ...prev, [q.id]: text }));
    } catch (e) {
      setFeedback((prev) => ({ ...prev, [q.id]: "Could not generate feedback." }));
    }
    setLoadingFeedback((prev) => ({ ...prev, [q.id]: false }));
  };

  const allScored = questions.length > 0 && questions.every((q) => scores[q.id]);

  const avgScore = () => {
    const vals = Object.values(scores).map(Number).filter(Boolean);
    if (!vals.length) return 0;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const catAvg = (cat) => {
    const qs = questions.filter((q) => q.cat === cat);
    const vals = qs.map((q) => scores[q.id]).filter(Boolean).map(Number);
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const verdict = () => {
    const avg = parseFloat(avgScore());
    const cats = [...new Set(questions.map((q) => q.cat))];
    const anyBelow2 = cats.some((c) => {
      const a = catAvg(c);
      return a !== null && parseFloat(a) < 2;
    });
    if (avg >= 3.0 && !anyBelow2) return { text: "RECOMMENDED TO PROCEED", color: "#16a34a", bg: "#f0fdf4" };
    if (avg >= 2.5) return { text: "BORDERLINE — REVIEW CAREFULLY", color: "#d97706", bg: "#fffbeb" };
    return { text: "NOT RECOMMENDED AT THIS LEVEL", color: "#dc2626", bg: "#fef2f2" };
  };

  const selectedBand = BANDS.find((b) => b.id === band);

  // SETUP SCREEN
  if (step === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }}></span>
              <span style={{ color: "#94a3b8", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Interview Session</span>
            </div>
            <h1 style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Data Engineer Interview</h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Configure the session before starting</p>
          </div>

          {/* Card */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {/* Candidate Name */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 8 }}>Candidate Name</label>
              <input
                placeholder="e.g. Alex Johnson"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#f1f5f9", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Platform */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 10 }}>Cloud Platform</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {PLATFORMS.map((p) => {
                  const icons = { Azure: "☁️", AWS: "⚡", Snowflake: "❄️" };
                  const active = platform === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      style={{
                        padding: "14px 10px",
                        borderRadius: 10,
                        border: active ? "2px solid #3b82f6" : "2px solid #334155",
                        background: active ? "#1d3a5e" : "#0f172a",
                        color: active ? "#93c5fd" : "#64748b",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{icons[p]}</span>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Band */}
            <div>
              <label style={{ color: "#94a3b8", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 10 }}>Experience Band</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {BANDS.map((b) => {
                  const active = band === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBand(b.id)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: active ? `2px solid ${b.color}` : "2px solid #334155",
                        background: active ? "#0f172a" : "#0f172a",
                        color: active ? "#f1f5f9" : "#64748b",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "left",
                        transition: "all 0.15s",
                        boxShadow: active ? `0 0 0 1px ${b.color}40 inset` : "none",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{b.emoji}</span>
                      <span>
                        <span style={{ color: active ? b.color : "#64748b", fontWeight: 700 }}>{b.label}</span>
                        <span style={{ color: "#475569", marginLeft: 8, fontSize: 12 }}>{b.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!platform || !band}
              style={{
                padding: "14px",
                borderRadius: 10,
                border: "none",
                background: platform && band ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#1e293b",
                color: platform && band ? "#fff" : "#475569",
                cursor: platform && band ? "pointer" : "not-allowed",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.02em",
                transition: "all 0.2s",
                boxShadow: platform && band ? "0 4px 20px rgba(59,130,246,0.3)" : "none",
              }}
            >
              {platform && band ? `Start Interview — ${platform} · ${selectedBand?.label}` : "Select platform & experience band"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (step === "results") {
    const v = verdict();
    const cats = [...new Set(questions.map((q) => q.cat))];
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "2rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ color: "#f1f5f9", fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>Interview Results</h1>
            <p style={{ color: "#64748b", margin: 0 }}>{candidateName || "Candidate"} · {platform} · {selectedBand?.title}</p>
          </div>

          {/* Verdict */}
          <div style={{ background: v.bg, border: `2px solid ${v.color}40`, borderRadius: 14, padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: v.color, marginBottom: 4 }}>{avgScore()}<span style={{ fontSize: 18, color: "#94a3b8" }}>/4</span></div>
            <div style={{ color: v.color, fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>{v.text}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>Minimum 3.0 avg with no category below 2.0</div>
          </div>

          {/* Category breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
            {cats.map((cat) => {
              const avg = catAvg(cat);
              const info = CATEGORIES[cat];
              const pass = avg && parseFloat(avg) >= 2.0;
              return (
                <div key={cat} style={{ background: "#1e293b", border: `1px solid ${avg && !pass ? "#dc262660" : "#334155"}`, borderRadius: 12, padding: "1rem" }}>
                  <div style={{ color: info.color, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{catLabel(cat)}</div>
                  <div style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 800 }}>{avg ?? "—"}<span style={{ fontSize: 14, color: "#64748b" }}>/4</span></div>
                  {avg && !pass && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>⚠ Below minimum threshold</div>}
                </div>
              );
            })}
          </div>

          {/* Q by Q */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
            {questions.map((q, i) => {
              const info = CATEGORIES[q.cat];
              return (
                <div key={q.id} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ background: info.bg, color: info.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", marginRight: 8 }}>{catLabel(q.cat)}</span>
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>Q{i + 1}</span>
                      <p style={{ color: "#e2e8f0", fontSize: 14, margin: "6px 0 0" }}>{q.q.length > 100 ? q.q.slice(0, 100) + "…" : q.q}</p>
                    </div>
                    <div style={{ background: scores[q.id] >= 3 ? "#16a34a22" : scores[q.id] >= 2 ? "#d9770622" : "#dc262622", border: `1px solid ${scores[q.id] >= 3 ? "#16a34a" : scores[q.id] >= 2 ? "#d97706" : "#dc2626"}60`, borderRadius: 8, padding: "6px 14px", textAlign: "center", minWidth: 48 }}>
                      <div style={{ color: scores[q.id] >= 3 ? "#16a34a" : scores[q.id] >= 2 ? "#d97706" : "#dc2626", fontWeight: 800, fontSize: 20 }}>{scores[q.id] ?? "—"}</div>
                    </div>
                  </div>
                  {answers[q.id] && <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", marginTop: 10, color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{answers[q.id].slice(0, 200)}{answers[q.id].length > 200 ? "…" : ""}</div>}
                  {feedback[q.id] && <div style={{ background: "#1d3a5e22", border: "1px solid #3b82f660", borderRadius: 8, padding: "10px 12px", marginTop: 8, color: "#93c5fd", fontSize: 13, lineHeight: 1.6 }}>🤖 {feedback[q.id]}</div>}
                </div>
              );
            })}
          </div>

          {/* Scoring rubric */}
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Scoring Rubric Reference</h3>
            {SCORING_RUBRIC.map((r) => (
              <div key={r.score} style={{ padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>{r.score}</span>
                <span style={{ color: "#64748b", fontSize: 12, marginLeft: 8 }}>→ {r.signal}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setStep("setup")} style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #334155", background: "#1e293b", color: "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            ← Start New Interview
          </button>
        </div>
      </div>
    );
  }

  // INTERVIEW SCREEN
  const progress = ((currentQ) / questions.length) * 100;
  const catInfo = CATEGORIES[currentQuestion?.cat];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>{candidateName || "Candidate"}</span>
          <span style={{ color: "#475569", margin: "0 8px" }}>·</span>
          <span style={{ color: "#64748b", fontSize: 14 }}>{platform} · {selectedBand?.title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>Q{currentQ + 1} of {questions.length}</span>
          {allScored && (
            <button onClick={() => setStep("results")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              View Results →
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "#1e293b" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", width: `${progress}%`, transition: "width 0.3s" }} />
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
        {/* Category pill */}
        <div style={{ marginBottom: "1.25rem" }}>
          <span style={{ background: catInfo?.bg || "#f8fafc", color: catInfo?.color || "#64748b", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {catLabel(currentQuestion?.cat)}
          </span>
          <span style={{ color: "#475569", fontSize: 13, marginLeft: 10 }}>Question {currentQ + 1}</span>
        </div>

        {/* Question */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.75rem", marginBottom: "1.25rem" }}>
          <p style={{ color: "#e2e8f0", fontSize: 18, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{currentQuestion?.q}</p>
        </div>

        {/* Answer textarea */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Interviewer Notes / Candidate's Answer</label>
          <textarea
            ref={(el) => (textareaRefs.current[currentQuestion?.id] = el)}
            value={answers[currentQuestion?.id] || ""}
            onChange={(e) => handleAnswerChange(currentQuestion?.id, e.target.value)}
            placeholder="Type notes here as the candidate responds..."
            rows={5}
            style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "14px 16px", color: "#e2e8f0", fontSize: 15, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* What to Listen For */}
        <div style={{ marginBottom: "1.25rem" }}>
          <button
            onClick={() => toggleWTLF(currentQuestion?.id)}
            style={{ background: "none", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px", color: "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>{showWTLF[currentQuestion?.id] ? "▼" : "▶"}</span>
            What to Listen For
          </button>
          {showWTLF[currentQuestion?.id] && (
            <div style={{ background: "#1e293b", border: `1px solid ${catInfo?.color}40`, borderLeft: `3px solid ${catInfo?.color}`, borderRadius: "0 12px 12px 0", padding: "1rem 1.25rem", marginTop: 8 }}>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{currentQuestion?.wtlf}</p>
            </div>
          )}
        </div>

        {/* AI Feedback */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => getFeedback(currentQuestion)}
            disabled={loadingFeedback[currentQuestion?.id] || !answers[currentQuestion?.id]?.trim()}
            style={{
              background: "none",
              border: "1px solid #3b82f660",
              borderRadius: 8,
              padding: "8px 14px",
              color: answers[currentQuestion?.id]?.trim() ? "#3b82f6" : "#334155",
              cursor: answers[currentQuestion?.id]?.trim() ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {loadingFeedback[currentQuestion?.id] ? "⏳ Generating…" : "🤖 Get AI Feedback"}
          </button>
          {feedback[currentQuestion?.id] && (
            <div style={{ background: "#1d3a5e33", border: "1px solid #3b82f660", borderRadius: 12, padding: "1rem 1.25rem", marginTop: 10 }}>
              <p style={{ color: "#93c5fd", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{feedback[currentQuestion?.id]}</p>
            </div>
          )}
        </div>

        {/* Scoring */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Score This Answer</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[1, 2, 3, 4].map((s) => {
              const labels = { 1: "Insufficient", 2: "Developing", 3: "Proficient", 4: "Exceptional" };
              const colors = { 1: "#dc2626", 2: "#d97706", 3: "#16a34a", 4: "#2563eb" };
              const active = scores[currentQuestion?.id] === s;
              return (
                <button
                  key={s}
                  onClick={() => handleScore(currentQuestion?.id, s)}
                  style={{
                    padding: "12px 8px",
                    borderRadius: 10,
                    border: active ? `2px solid ${colors[s]}` : "2px solid #334155",
                    background: active ? `${colors[s]}22` : "#0f172a",
                    color: active ? colors[s] : "#475569",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{s}</span>
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>{labels[s]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button
            onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #334155", background: "#1e293b", color: currentQ === 0 ? "#334155" : "#94a3b8", cursor: currentQ === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}
          >
            ← Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ((q) => q + 1)}
              style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
            >
              Next Question →
            </button>
          ) : (
            <button
              onClick={() => setStep("results")}
              style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: allScored ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${allScored ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.3)"}` }}
            >
              {allScored ? "View Results →" : "Finish & Review →"}
            </button>
          )}
        </div>

        {/* Question nav dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: "1.5rem", flexWrap: "wrap" }}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: i === currentQ ? "2px solid #3b82f6" : "2px solid #334155",
                background: scores[q.id] ? (scores[q.id] >= 3 ? "#16a34a33" : scores[q.id] >= 2 ? "#d9770633" : "#dc262633") : (i === currentQ ? "#1d3a5e" : "#0f172a"),
                color: i === currentQ ? "#3b82f6" : scores[q.id] ? "#f1f5f9" : "#475569",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
