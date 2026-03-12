import { useState, useEffect } from "react";

const PLATFORMS = ["Azure", "AWS", "Snowflake"];
const BANDS = [
  { id: "junior", label: "0–3 Years", color: "#10b981", emoji: "🟢", title: "Junior / Entry Level" },
  { id: "mid",    label: "3–5 Years", color: "#f59e0b", emoji: "🟠", title: "Mid-Level" },
  { id: "senior", label: "5+ Years",  color: "#8b5cf6", emoji: "🟣", title: "Senior / Lead" },
];
const CATEGORIES = {
  SQL:         { color: "#38bdf8", tag: "SQL" },
  Cloud:       { color: "#34d399", tag: "Cloud Technology" },
  Python:      { color: "#a78bfa", tag: "Python" },
  Stakeholder: { color: "#f472b6", tag: "Stakeholder Mgmt" },
};

const QUESTIONS = {
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

const STORAGE_KEY = "de_interview_session";

const saveSession = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
};

const loadSession = () => {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch(e) { return null; }
};

export default function App() {
  const isInterviewer = typeof window !== "undefined" && window.location.search.includes("interviewer=true");

  const [step, setStep] = useState("setup");
  const [platform, setPlatform] = useState(null);
  const [band, setBand] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (isInterviewer) {
      const s = loadSession();
      setSession(s);
    }
  }, [isInterviewer]);

  const questions = platform && band ? QUESTIONS[platform][band] : [];
  const selectedBand = BANDS.find(b => b.id === band);

  const handleStart = () => {
    if (!platform || !band || !candidateName.trim()) return;
    setStep("interview");
    setCurrentQ(0);
    setAnswers({});
  };

  const handleSubmit = () => {
    const sessionData = {
      candidateName,
      yearsExp,
      platform,
      band,
      answers,
      submittedAt: new Date().toISOString(),
    };
    saveSession(sessionData);
    setSubmitted(true);
    setStep("thankyou");
  };

  // ─── INTERVIEWER VIEW ────────────────────────────────────────────────
  if (isInterviewer) {
    if (!session) {
      return (
        <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
          <div style={{ textAlign:"center", color:"#64748b" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
            <h2 style={{ color:"#f1f5f9", fontSize:22, margin:"0 0 8px" }}>No Submission Yet</h2>
            <p style={{ margin:0, fontSize:15 }}>The candidate hasn't completed the interview on this device yet.</p>
          </div>
        </div>
      );
    }

    const qs = QUESTIONS[session.platform]?.[session.band] || [];
    const cats = [...new Set(qs.map(q => q.cat))];

    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          {/* Header */}
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ color:"#94a3b8", fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Interviewer Results</div>
                <h1 style={{ color:"#f1f5f9", fontSize:24, fontWeight:800, margin:"0 0 4px" }}>{session.candidateName}</h1>
                <div style={{ color:"#64748b", fontSize:14 }}>
                  {session.platform} · {BANDS.find(b=>b.id===session.band)?.title}
                  {session.yearsExp && <span> · {session.yearsExp} yrs experience</span>}
                </div>
                <div style={{ color:"#475569", fontSize:12, marginTop:4 }}>
                  Submitted: {new Date(session.submittedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:12, padding:"1rem 1.5rem", textAlign:"center" }}>
                <div style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Questions Answered</div>
                <div style={{ color:"#f1f5f9", fontSize:32, fontWeight:800 }}>
                  {Object.keys(session.answers).length}<span style={{ color:"#475569", fontSize:16 }}>/{qs.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring instructions */}
          <div style={{ background:"#1e293b", border:"1px solid #f59e0b40", borderLeft:"3px solid #f59e0b", borderRadius:"0 12px 12px 0", padding:"12px 16px", marginBottom:"1.5rem" }}>
            <p style={{ color:"#fcd34d", fontSize:13, margin:0 }}>
              📋 <strong>Interviewer Mode</strong> — Review each answer below and assign a score (1–4). Scores are calculated in real time.
            </p>
          </div>

          {/* Questions + Answers + Scoring */}
          {qs.map((q, i) => {
            const info = CATEGORIES[q.cat];
            const answer = session.answers[q.id];
            return (
              <div key={q.id} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ marginBottom:8 }}>
                      <span style={{ background: info.color+"22", color:info.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em", marginRight:8 }}>{info.tag}</span>
                      <span style={{ color:"#475569", fontSize:12 }}>Q{i+1}</span>
                    </div>
                    <p style={{ color:"#e2e8f0", fontSize:15, margin:"0 0 12px", fontWeight:500, lineHeight:1.6 }}>{q.q}</p>

                    {/* Candidate answer */}
                    <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
                      <div style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Candidate's Answer</div>
                      <p style={{ color: answer ? "#cbd5e1" : "#475569", fontSize:14, margin:0, lineHeight:1.7, fontStyle: answer ? "normal" : "italic" }}>
                        {answer || "No answer provided"}
                      </p>
                    </div>

                    {/* What to listen for */}
                    <details style={{ marginBottom:0 }}>
                      <summary style={{ color:"#64748b", fontSize:13, cursor:"pointer", userSelect:"none" }}>▶ What to Listen For</summary>
                      <div style={{ background:"#0f172a", borderLeft:`3px solid ${info.color}`, borderRadius:"0 8px 8px 0", padding:"10px 14px", marginTop:8 }}>
                        <p style={{ color:"#94a3b8", fontSize:13, margin:0, lineHeight:1.7 }}>{q.wtlf}</p>
                      </div>
                    </details>
                  </div>

                  {/* Score selector */}
                  <div style={{ display:"flex", flexDirection:"column", gap:6, minWidth:52 }}>
                    {[4,3,2,1].map(s => {
                      const cols = {4:"#2563eb",3:"#16a34a",2:"#d97706",1:"#dc2626"};
                      const active = scores[q.id] === s;
                      return (
                        <button key={s} onClick={() => setScores(prev => ({...prev, [q.id]: s}))}
                          style={{ width:52, height:52, borderRadius:10, border: active ? `2px solid ${cols[s]}` : "2px solid #334155",
                            background: active ? `${cols[s]}33` : "#0f172a", color: active ? cols[s] : "#475569",
                            cursor:"pointer", fontWeight:800, fontSize:18, transition:"all 0.15s" }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Results Summary */}
          {Object.keys(scores).length > 0 && (
            <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.5rem", marginTop:"1.5rem" }}>
              <h3 style={{ color:"#f1f5f9", fontSize:18, fontWeight:700, margin:"0 0 1rem" }}>Score Summary</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:"1rem" }}>
                {cats.map(cat => {
                  const catQs = qs.filter(q => q.cat === cat);
                  const vals = catQs.map(q => scores[q.id]).filter(Boolean);
                  const avg = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null;
                  const info = CATEGORIES[cat];
                  return (
                    <div key={cat} style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ color:info.color, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{info.tag}</div>
                      <div style={{ color:"#f1f5f9", fontSize:26, fontWeight:800 }}>{avg ?? "—"}<span style={{ color:"#475569", fontSize:13 }}>/4</span></div>
                      {avg && parseFloat(avg) < 2 && <div style={{ color:"#dc2626", fontSize:11, marginTop:2 }}>⚠ Below minimum</div>}
                    </div>
                  );
                })}
              </div>
              {/* Overall */}
              {(() => {
                const allVals = Object.values(scores).map(Number);
                const overall = allVals.length ? (allVals.reduce((a,b)=>a+b,0)/allVals.length).toFixed(2) : null;
                const anyBelow2 = cats.some(c => {
                  const vals = qs.filter(q=>q.cat===c).map(q=>scores[q.id]).filter(Boolean);
                  return vals.length && (vals.reduce((a,b)=>a+b,0)/vals.length) < 2;
                });
                const verdict = overall && parseFloat(overall) >= 3.0 && !anyBelow2
                  ? { text:"RECOMMENDED TO PROCEED", color:"#16a34a", bg:"#f0fdf4" }
                  : overall && parseFloat(overall) >= 2.5
                  ? { text:"BORDERLINE — REVIEW CAREFULLY", color:"#d97706", bg:"#fffbeb" }
                  : { text:"NOT RECOMMENDED AT THIS LEVEL", color:"#dc2626", bg:"#fef2f2" };
                return overall ? (
                  <div style={{ background:verdict.bg, border:`2px solid ${verdict.color}40`, borderRadius:12, padding:"1.25rem", textAlign:"center" }}>
                    <div style={{ fontSize:32, fontWeight:800, color:verdict.color }}>{overall}<span style={{ fontSize:16, color:"#94a3b8" }}>/4</span></div>
                    <div style={{ color:verdict.color, fontWeight:700, fontSize:13, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:4 }}>{verdict.text}</div>
                    <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>Min 3.0 avg · No category below 2.0</div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── THANK YOU SCREEN ────────────────────────────────────────────────
  if (step === "thankyou") {
    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ maxWidth:480, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:64, marginBottom:24 }}>✅</div>
          <h1 style={{ color:"#f1f5f9", fontSize:28, fontWeight:800, margin:"0 0 12px" }}>Thank You, {candidateName}!</h1>
          <p style={{ color:"#64748b", fontSize:16, lineHeight:1.7, margin:"0 0 24px" }}>
            Your answers have been successfully submitted. The interviewer will review your responses shortly.
          </p>
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"1.25rem" }}>
            <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>
              📬 Your submission has been recorded.<br/>You may now close this window.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── SETUP SCREEN ────────────────────────────────────────────────────
  if (step === "setup") {
    return (
      <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:520 }}>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"6px 14px", marginBottom:16 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 6px #22c55e" }}></span>
              <span style={{ color:"#94a3b8", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase" }}>Data Engineer Interview</span>
            </div>
            <h1 style={{ color:"#f1f5f9", fontSize:26, fontWeight:800, margin:"0 0 8px", letterSpacing:"-0.5px" }}>Welcome</h1>
            <p style={{ color:"#64748b", fontSize:14, margin:0 }}>Please fill in your details to begin</p>
          </div>

          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"2rem", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
            {/* Name */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Full Name *</label>
              <input placeholder="e.g. Alex Johnson" value={candidateName} onChange={e => setCandidateName(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            {/* Years of Experience */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Years of Experience *</label>
              <input placeholder="e.g. 4" type="number" min="0" max="40" value={yearsExp} onChange={e => setYearsExp(e.target.value)}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontSize:15, outline:"none", boxSizing:"border-box" }} />
            </div>

            {/* Platform */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>Cloud Platform *</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {PLATFORMS.map(p => {
                  const icons = { Azure:"☁️", AWS:"⚡", Snowflake:"❄️" };
                  const active = platform === p;
                  return (
                    <button key={p} onClick={() => setPlatform(p)}
                      style={{ padding:"14px 8px", borderRadius:10, border: active ? "2px solid #3b82f6" : "2px solid #334155",
                        background: active ? "#1d3a5e" : "#0f172a", color: active ? "#93c5fd" : "#64748b",
                        cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:22 }}>{icons[p]}</span>{p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Band */}
            <div>
              <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:10 }}>Experience Band *</label>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {BANDS.map(b => {
                  const active = band === b.id;
                  return (
                    <button key={b.id} onClick={() => setBand(b.id)}
                      style={{ padding:"12px 16px", borderRadius:10, border: active ? `2px solid ${b.color}` : "2px solid #334155",
                        background:"#0f172a", color: active ? "#f1f5f9" : "#64748b", cursor:"pointer", fontSize:14, fontWeight:500,
                        display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                      <span style={{ fontSize:18 }}>{b.emoji}</span>
                      <span><span style={{ color: active ? b.color : "#64748b", fontWeight:700 }}>{b.label}</span>
                        <span style={{ color:"#475569", marginLeft:8, fontSize:12 }}>{b.title}</span></span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleStart} disabled={!platform || !band || !candidateName.trim() || !yearsExp.trim()}
              style={{ padding:"14px", borderRadius:10, border:"none",
                background: (platform && band && candidateName.trim() && yearsExp.trim()) ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "#1e293b",
                color: (platform && band && candidateName.trim() && yearsExp.trim()) ? "#fff" : "#475569",
                cursor: (platform && band && candidateName.trim() && yearsExp.trim()) ? "pointer" : "not-allowed",
                fontSize:15, fontWeight:700, boxShadow: (platform && band && candidateName.trim() && yearsExp.trim()) ? "0 4px 20px rgba(59,130,246,0.3)" : "none" }}>
              Begin Interview →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── INTERVIEW SCREEN ────────────────────────────────────────────────
  const currentQuestion = questions[currentQ];
  const catInfo = CATEGORIES[currentQuestion?.cat];
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

      {/* Progress bar */}
      <div style={{ height:3, background:"#1e293b" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#3b82f6,#8b5cf6)", width:`${((currentQ)/questions.length)*100}%`, transition:"width 0.3s" }} />
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"2rem" }}>
        {/* Category pill */}
        <div style={{ marginBottom:"1.25rem" }}>
          <span style={{ background:catInfo?.color+"22", color:catInfo?.color, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {catInfo?.tag}
          </span>
          <span style={{ color:"#475569", fontSize:13, marginLeft:10 }}>Question {currentQ+1}</span>
        </div>

        {/* Question */}
        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:16, padding:"1.75rem", marginBottom:"1.25rem" }}>
          <p style={{ color:"#e2e8f0", fontSize:18, lineHeight:1.7, margin:0, fontWeight:500 }}>{currentQuestion?.q}</p>
        </div>

        {/* Answer */}
        <div style={{ marginBottom:"1.5rem" }}>
          <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>Your Answer</label>
          <textarea value={answers[currentQuestion?.id] || ""} onChange={e => setAnswers(prev => ({...prev, [currentQuestion.id]: e.target.value}))}
            placeholder="Type your answer here..." rows={6}
            style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"14px 16px", color:"#e2e8f0",
              fontSize:15, lineHeight:1.6, resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
          <button onClick={() => setCurrentQ(q => Math.max(0, q-1))} disabled={currentQ === 0}
            style={{ flex:1, padding:"12px", borderRadius:10, border:"1px solid #334155", background:"#1e293b",
              color: currentQ === 0 ? "#334155" : "#94a3b8", cursor: currentQ === 0 ? "not-allowed" : "pointer", fontSize:14, fontWeight:600 }}>
            ← Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(q => q+1)}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#3b82f6,#2563eb)",
                color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700, boxShadow:"0 4px 14px rgba(59,130,246,0.3)" }}>
              Next Question →
            </button>
          ) : (
            <button onClick={handleSubmit}
              style={{ flex:1, padding:"12px", borderRadius:10, border:"none",
                background: allAnswered ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#3b82f6,#2563eb)",
                color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700,
                boxShadow:`0 4px 14px ${allAnswered ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.3)"}` }}>
              {allAnswered ? "Submit Answers ✓" : "Submit Answers →"}
            </button>
          )}
        </div>

        {/* Dot nav */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:"1.5rem", flexWrap:"wrap" }}>
          {questions.map((q, i) => (
            <button key={q.id} onClick={() => setCurrentQ(i)}
              style={{ width:28, height:28, borderRadius:"50%", border: i === currentQ ? "2px solid #3b82f6" : "2px solid #334155",
                background: answers[q.id]?.trim() ? "#22c55e33" : (i === currentQ ? "#1d3a5e" : "#0f172a"),
                color: i === currentQ ? "#3b82f6" : answers[q.id]?.trim() ? "#22c55e" : "#475569",
                cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {i+1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
