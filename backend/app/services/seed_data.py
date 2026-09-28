import os
import datetime
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models import (
    User, UserRole, Business, Department, Approval, ApprovalRule,
    ApprovalRequirement, Document, GovernmentScheme, Renewal,
    Application, ApplicationDocument, ApplicationStatusHistory, Query, Inspection, Notification
)
from backend.app.services.auth import get_password_hash
from backend.app.services.pdf_service import generate_sample_pdf

def seed_database(db: Session):
    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "demo@example.com").first()
    if existing_user:
        return

    print(">>> Seeding database with demo regulatory data...")

    # 1. Users
    demo_password_hash = get_password_hash("Demo123!")

    entrepreneur = User(
        email="demo@example.com",
        hashed_password=demo_password_hash,
        full_name="Rajesh Sharma (Entrepreneur)",
        role=UserRole.ENTREPRENEUR.value,
        phone="+91 98765 43210"
    )
    db.add(entrepreneur)

    officer = User(
        email="officer@example.com",
        hashed_password=demo_password_hash,
        full_name="Dr. Vikram Deshmukh (Senior Food Safety Officer)",
        role=UserRole.OFFICER.value,
        phone="+91 91234 56789",
        department_name="Food Safety & Standards Authority",
        designation="Joint Commissioner & Regulatory Inspecting Officer"
    )
    db.add(officer)

    admin = User(
        email="admin@example.com",
        hashed_password=demo_password_hash,
        full_name="Priya Nair (System Administrator)",
        role=UserRole.ADMIN.value,
        phone="+91 99887 76655",
        department_name="Directorate of Industrial Policy & Promotion"
    )
    db.add(admin)
    db.commit()
    db.refresh(entrepreneur)
    db.refresh(officer)
    db.refresh(admin)

    # 2. Business
    business = Business(
        owner_id=entrepreneur.id,
        name="Demo Food Processing Unit",
        business_type="Manufacturing",
        sector="Food Processing",
        description="State-of-the-art organic agro-processing unit specializing in aseptic fruit pulp, ready-to-cook dehydrated vegetable mixtures, and packaged healthy snacks.",
        applicant_name="Rajesh Sharma",
        phone="+91 98765 43210",
        email="demo@example.com",
        state="Maharashtra",
        district="Pune",
        city="Pune",
        address="Plot No. E-42, Chakan Industrial Area, Phase-II, MIDC, Pune, Maharashtra",
        pincode="410501",
        investment=5000000.0,  # ₹50,00,000
        employees=25,
        business_stage="PLANNING",
        land_property="Leased Industrial Plot (MIDC 99-Yr Lease)",
        business_activity="Agro & Food Processing / Fruit Pulp Extraction / Packaging",
        profile_completion=95
    )
    db.add(business)
    db.commit()
    db.refresh(business)

    # 3. Departments
    dept_fssai = Department(code="FSSAI", name="Food Safety and Standards Authority of India", contact_email="Suvidha@fssai.gov.in.demo")
    dept_dish = Department(code="DISH", name="Directorate of Industrial Safety and Health (DISH)", contact_email="factories@dish.maharashtra.gov.in.demo")
    dept_mpcb = Department(code="MPCB", name="Maharashtra Pollution Control Board (MPCB)", contact_email="Suvidha@mpcb.gov.in.demo")
    dept_fire = Department(code="FIRE", name="State Fire & Emergency Services", contact_email="firenoc@mahafire.gov.in.demo")
    dept_midc = Department(code="MIDC", name="Maharashtra Industrial Development Corporation", contact_email="support@midcindia.org.demo")

    db.add_all([dept_fssai, dept_dish, dept_mpcb, dept_fire, dept_midc])
    db.commit()

    # 4. Approvals
    # Approval 1: Food Processing Registration (Primary demo target)
    app_fssai = Approval(
        department_id=dept_fssai.id,
        name="Demo Food Processing Registration & Manufacturing License",
        code="FSSAI-MFG-01",
        authority="Food Safety and Standards Authority of India (FSSAI)",
        description="Statutory manufacturing license required under Food Safety & Standards Act for processing, packaging, and commercial distribution of food items.",
        timeline_days=21,
        renewal_frequency_months=12,
        mandatory=True,
        fee_estimate="₹7,500 (Annual)",
        penalty_info="Operating without clearance entails penal seizure and fine up to ₹5,00,000."
    )

    # Approval 2: Factory Approval
    app_factory = Approval(
        department_id=dept_dish.id,
        name="Demo Factory Plan Approval & Registration",
        code="FACTORY-ACT-01",
        authority="Directorate of Industrial Safety & Health (DISH)",
        description="Approval of architectural plant layout, equipment spacing, ventilation, worker health standards, and emergency exits under The Factories Act.",
        timeline_days=30,
        renewal_frequency_months=36,
        mandatory=True,
        fee_estimate="₹12,000 (3 Years)",
        penalty_info="Non-compliance invites notice under Section 6 of Factories Act."
    )

    # Approval 3: Environmental Consent
    app_mpcb = Approval(
        department_id=dept_mpcb.id,
        name="Demo Environmental Consent to Establish (Orange Category)",
        code="MPCB-CTE-01",
        authority="Maharashtra Pollution Control Board (MPCB)",
        description="Mandatory prior environmental clearance for wastewater discharge, organic solid waste management, and effluent treatment compliance.",
        timeline_days=45,
        renewal_frequency_months=36,
        mandatory=True,
        dependencies="FACTORY-ACT-01",
        fee_estimate="₹15,000 (Capital scale ₹50L)",
        penalty_info="Immediate stop-work order under Air & Water Pollution Control Acts."
    )

    # Approval 4: Fire NOC
    app_fire = Approval(
        department_id=dept_fire.id,
        name="Demo Fire Safety Provisional NOC",
        code="FIRE-NOC-01",
        authority="State Fire & Emergency Services",
        description="Verification of on-site fire fighting readiness, hydrants, smoke detectors, automated sprinkler layout, and clear escape routes.",
        timeline_days=15,
        renewal_frequency_months=12,
        mandatory=True,
        fee_estimate="₹5,000",
        penalty_info="Disconnection of industrial electricity upon failed compliance."
    )

    # Approval 5: Local Trade License
    app_midc = Approval(
        department_id=dept_midc.id,
        name="Demo Local Industrial Trade & Activity Permit",
        code="MIDC-TRADE-01",
        authority="MIDC Regional Office / Municipal Corporation",
        description="Local municipal activity authorization for commercial operation inside planned industrial zones.",
        timeline_days=14,
        renewal_frequency_months=12,
        mandatory=True,
        fee_estimate="₹3,000",
        penalty_info="Daily late demurrage fine."
    )

    db.add_all([app_fssai, app_factory, app_mpcb, app_fire, app_midc])
    db.commit()

    # 5. Approval Rules (Deterministic engine)
    rules = [
        ApprovalRule(approval_id=app_fssai.id, condition_field="sector", operator="equals", condition_value="Food Processing", explanation="Applicable because enterprise operates in the Food Processing sector."),
        ApprovalRule(approval_id=app_fssai.id, condition_field="state", operator="equals", condition_value="Maharashtra", explanation="Governed under Maharashtra Food Safety jurisdiction."),
        
        ApprovalRule(approval_id=app_factory.id, condition_field="business_type", operator="equals", condition_value="Manufacturing", explanation="Manufacturing operations require factory clearance."),
        ApprovalRule(approval_id=app_factory.id, condition_field="employees", operator="gte", condition_value="10", explanation="Employing 10 or more workers triggers the Factories Act statutory mandate."),
        
        ApprovalRule(approval_id=app_mpcb.id, condition_field="sector", operator="in", condition_value="Food Processing,Chemical,Textile", explanation="Agro & Food Processing generates organic effluent requiring pollution board consent."),
        
        ApprovalRule(approval_id=app_fire.id, condition_field="business_type", operator="equals", condition_value="Manufacturing", explanation="Industrial premises require fire safety NOC."),
        
        ApprovalRule(approval_id=app_midc.id, condition_field="state", operator="equals", condition_value="Maharashtra", explanation="State jurisdiction trade permit required.")
    ]
    db.add_all(rules)

    # 6. Approval Requirements
    # For FSSAI: 5 documents total
    reqs_fssai = [
        ApprovalRequirement(approval_id=app_fssai.id, document_type="Certificate of Incorporation / Partnership Deed", name="Certificate of Incorporation / Business Constitution", category="Business", description="Proof of legal entity registration (MCA / Registrar).", is_mandatory=True),
        ApprovalRequirement(approval_id=app_fssai.id, document_type="PAN & GST Registration Certificate", name="PAN & GST Registration Certificate", category="Financial", description="Valid GST registration showing food processing HSN/SAC codes.", is_mandatory=True),
        ApprovalRequirement(approval_id=app_fssai.id, document_type="Land Lease Deed / Ownership Proof", name="Land Lease Deed / Premises Possession Proof", category="Land/Property", description="Registered lease deed (MIDC plot allotment) or title deed.", is_mandatory=True),
        ApprovalRequirement(approval_id=app_fssai.id, document_type="Food Safety Management Plan", name="Food Safety Management System (FSMS) Plan", category="Technical", description="Documented hygiene, sanitation, and HACCP workflow layout.", is_mandatory=True),
        # Document #5: MISSING Initially to demonstrate 80% readiness!
        ApprovalRequirement(approval_id=app_fssai.id, document_type="Water Quality & Potability Test Report", name="Water Potability & Chemical Analysis Report (IS 10500)", category="Compliance", description="NABL lab analysis testing chemical and microbiological safety of process water.", is_mandatory=True)
    ]
    db.add_all(reqs_fssai)

    # Requirements for others
    db.add_all([
        ApprovalRequirement(approval_id=app_factory.id, document_type="Factory Layout & Machine Installation Plan", name="Factory Machine Layout & Architectural Drawing", category="Technical", is_mandatory=True),
        ApprovalRequirement(approval_id=app_factory.id, document_type="Land Lease Deed / Ownership Proof", name="Land Allotment Order", category="Land/Property", is_mandatory=True),
        ApprovalRequirement(approval_id=app_mpcb.id, document_type="Environmental Impact & Effluent Management Plan", name="Effluent Treatment Plant (ETP) Project Scheme", category="Environmental", is_mandatory=True),
        ApprovalRequirement(approval_id=app_fire.id, document_type="Fire Safety NOC & Evacuation Plan", name="Fire Extinguishing & Evacuation Scheme", category="NOCs", is_mandatory=True),
        ApprovalRequirement(approval_id=app_midc.id, document_type="Certificate of Incorporation / Partnership Deed", name="Incorporation Certificate", category="Business", is_mandatory=True)
    ])
    db.commit()

    # 7. Generate Real PDFs for Initial Demo Vault & Missing Sample
    samples_dir = os.path.join(settings.STORAGE_PATH, "samples")
    uploads_dir = os.path.join(settings.STORAGE_PATH, "uploads", str(entrepreneur.id))
    os.makedirs(samples_dir, exist_ok=True)
    os.makedirs(uploads_dir, exist_ok=True)

    # Document 1: Incorporation
    pdf_inc = os.path.join(uploads_dir, "demo_incorporation_cert.pdf")
    generate_sample_pdf(
        title="Certificate of Incorporation",
        subtitle="Ministry of Corporate Affairs — Registrar of Companies",
        doc_number="U15400MH2026PTC392811",
        authority="Registrar of Companies, Pune",
        body_text="This is to certify that DEMO FOOD PROCESSING UNIT PRIVATE LIMITED is incorporated on this Eleventh day of January Two Thousand Twenty-Six under the Companies Act, 2013.\n\nThe Corporate Identity Number of the company is U15400MH2026PTC392811. The registered office of the company is situated at Plot No. E-42, Chakan Industrial Area, Phase-II, MIDC, Pune 410501.",
        output_path=pdf_inc
    )

    # Document 2: PAN & GST
    pdf_gst = os.path.join(uploads_dir, "demo_pan_gstin.pdf")
    generate_sample_pdf(
        title="Goods & Services Tax Registration Certificate",
        subtitle="Government of India — Central Board of Indirect Taxes and Customs",
        doc_number="27AABCD9876E1Z5",
        authority="Goods & Services Tax Department, Pune Zone",
        body_text="Registration Number (GSTIN): 27AABCD9876E1Z5\nLegal Name: Demo Food Processing Unit Pvt Ltd\nPermanent Account Number (PAN): AABCD9876E\n\nAuthorized Activities: Manufacture of food products, fruit purees, pulp concentrates, preserved condiments and agro commodities.",
        output_path=pdf_gst
    )

    # Document 3: Land Lease Deed
    pdf_land = os.path.join(uploads_dir, "demo_midc_lease_deed.pdf")
    generate_sample_pdf(
        title="Industrial Plot 99-Year Lease Deed",
        subtitle="Maharashtra Industrial Development Corporation (MIDC)",
        doc_number="MIDC/PUN/CHK-II/PLOT-42/2026",
        authority="Area Development Office, MIDC Chakan",
        body_text="This Indenture of Lease made between MIDC and Demo Food Processing Unit Pvt Ltd demising Plot No. E-42, Chakan Industrial Area, Phase-II, admeasuring 2,500 square meters for setting up an Agro-Processing and Food Manufacturing Facility.\n\nThe lessee has full peaceful possession and title for statutory clearances and construction.",
        output_path=pdf_land
    )

    # Document 4: Food Safety Plan
    pdf_fsms = os.path.join(uploads_dir, "demo_food_safety_plan.pdf")
    generate_sample_pdf(
        title="Food Safety Management System (FSMS) Plan",
        subtitle="Good Manufacturing Practices (GMP) & HACCP Standard Compliance",
        doc_number="FSMS-PLAN-2026-V1",
        authority="Demo Quality Assurance & Technical Consultancy",
        body_text="Comprehensive Process Workflow: 1. Raw Agro Receiving & Sorting -> 2. Ozone Washing & Peeling -> 3. Thermal Pulp Extraction (85°C Flash Pasteurization) -> 4. Aseptic Bag Filling -> 5. Secondary Packaging & Metal Detection.\n\nHACCP Critical Control Points (CCPs) established for temperature control, microbial thresholds, and food contact surfaces.",
        output_path=pdf_fsms
    )

    # Document 5: THE MISSING DOCUMENT — Saved in `samples` folder so entrepreneur can download and upload!
    pdf_water = os.path.join(samples_dir, "sample_water_potability_report.pdf")
    generate_sample_pdf(
        title="Water Quality & Potability Test Report (IS 10500)",
        subtitle="NABL Accredited Chemical & Microbiological Environmental Testing Lab",
        doc_number="NABL/ENV/2026/W-84920",
        authority="Apex Environmental NABL Analytical Laboratories",
        body_text="Water Sample Source: Industrial Borewell & Municipal Filtration System (Plot E-42 Chakan MIDC).\n\nParameters Tested:\n- pH: 7.2 (Acceptable range 6.5 - 8.5)\n- Total Dissolved Solids (TDS): 210 mg/L (Limit: 500 mg/L)\n- Coliform & E. Coli: Absent / 100 ml\n- Toxic Heavy Metals (Pb, As, Hg): Below Detectable Limits\n\nCONCLUSION: Water meets all statutory potability requirements under IS 10500:2012 for industrial food manufacturing.",
        output_path=pdf_water
    )

    # Register initial 4 documents into the Vault
    docs = [
        Document(
            business_id=business.id,
            uploaded_by_id=entrepreneur.id,
            file_path=pdf_inc,
            filename="demo_incorporation_cert.pdf",
            original_name="Certificate of Incorporation.pdf",
            file_size=os.path.getsize(pdf_inc),
            mime_type="application/pdf",
            category="Business",
            doc_type="Certificate of Incorporation / Partnership Deed",
            doc_number="U15400MH2026PTC392811",
            issuing_authority="Ministry of Corporate Affairs (MCA)",
            issue_date="2026-01-11",
            expiry_date=None,
            validity_status="VALID",
            is_verified=True,
            ai_detected=True,
            ocr_extracted_text="DEMO FOOD PROCESSING UNIT PRIVATE LIMITED Certificate of Incorporation U15400MH2026PTC392811"
        ),
        Document(
            business_id=business.id,
            uploaded_by_id=entrepreneur.id,
            file_path=pdf_gst,
            filename="demo_pan_gstin.pdf",
            original_name="PAN & GST Registration.pdf",
            file_size=os.path.getsize(pdf_gst),
            mime_type="application/pdf",
            category="Financial",
            doc_type="PAN & GST Registration Certificate",
            doc_number="27AABCD9876E1Z5",
            issuing_authority="Goods and Services Tax Network (GSTN)",
            issue_date="2026-01-15",
            expiry_date=None,
            validity_status="VALID",
            is_verified=True,
            ai_detected=True,
            ocr_extracted_text="GSTIN 27AABCD9876E1Z5 PAN AABCD9876E Demo Food Processing Unit"
        ),
        Document(
            business_id=business.id,
            uploaded_by_id=entrepreneur.id,
            file_path=pdf_land,
            filename="demo_midc_lease_deed.pdf",
            original_name="MIDC Plot 42 Lease Deed.pdf",
            file_size=os.path.getsize(pdf_land),
            mime_type="application/pdf",
            category="Land/Property",
            doc_type="Land Lease Deed / Ownership Proof",
            doc_number="MIDC/PUN/CHK-II/PLOT-42/2026",
            issuing_authority="Maharashtra Industrial Development Corporation",
            issue_date="2026-01-20",
            expiry_date=None,
            validity_status="VALID",
            is_verified=True,
            ai_detected=True,
            ocr_extracted_text="Plot No. E-42 Chakan Industrial Area Phase-II MIDC Lease Deed"
        ),
        Document(
            business_id=business.id,
            uploaded_by_id=entrepreneur.id,
            file_path=pdf_fsms,
            filename="demo_food_safety_plan.pdf",
            original_name="Food Safety Management Plan HACCP.pdf",
            file_size=os.path.getsize(pdf_fsms),
            mime_type="application/pdf",
            category="Technical",
            doc_type="Food Safety Management Plan",
            doc_number="FSMS-PLAN-2026-V1",
            issuing_authority="Food Safety and Standards Authority of India (FSSAI)",
            issue_date="2026-02-01",
            expiry_date=(datetime.datetime.utcnow() + datetime.timedelta(days=365)).strftime("%Y-%m-%d"),
            validity_status="VALID",
            days_to_expiry=365,
            is_verified=True,
            ai_detected=True,
            ocr_extracted_text="Food Safety Management Plan FSMS HACCP Critical Control Points"
        )
    ]
    db.add_all(docs)
    db.commit()

    # 8. Seed Schemes
    schemes = [
        GovernmentScheme(
            name="Pradhan Mantri Kisan SAMPADA Yojana (PMKSY)",
            ministry="Ministry of Food Processing Industries (MoFPI)",
            sector="Food Processing",
            target_stage="PLANNING, SETUP, OPERATIONAL",
            min_investment=2500000.0,
            max_investment=100000000.0,
            benefits_summary="Capital grant of 35% of eligible plant & machinery cost (up to ₹5 Crore) for establishing food processing units and modern supply chain infrastructure.",
            subsidy_percentage="35% of Equipment Cost",
            max_subsidy_amount="₹5,00,00,000",
            eligibility_criteria="New or expanding food processing units with project investment >= ₹25 Lakhs, located in notified industrial clusters.",
            required_documents="DPR (Detailed Project Report), Land Possession Proof, FSSAI Registration, Bank Appraisal Letter",
            application_url="https://mofpi.gov.in/pmksy/demo",
            deadline="Open for Current Fiscal Year"
        ),
        GovernmentScheme(
            name="PM Formalisation of Micro Food Processing Enterprises (PMFME)",
            ministry="Ministry of Food Processing Industries (MoFPI)",
            sector="Food Processing",
            target_stage="PLANNING, SETUP",
            min_investment=500000.0,
            max_investment=10000000.0,
            benefits_summary="Credit-linked capital subsidy of 35% of the eligible project cost with a maximum ceiling of ₹10 lakh per unit for individual micro enterprises.",
            subsidy_percentage="35% Subsidy",
            max_subsidy_amount="₹10,00,000",
            eligibility_criteria="Micro food processing units with investment up to ₹1 Crore and employee size up to 30.",
            required_documents="Aadhaar, PAN, Bank Statement, Udyam Registration, Land Agreement",
            application_url="https://pmfme.mofpi.gov.in/demo",
            deadline="Quarterly Grant Cycles"
        ),
        GovernmentScheme(
            name="Credit Guarantee Fund Trust for Micro & Small Enterprises (CGTMSE)",
            ministry="Ministry of MSME & SIDBI",
            sector="Manufacturing",
            target_stage="PLANNING, SETUP, EXPANSION",
            min_investment=1000000.0,
            max_investment=50000000.0,
            benefits_summary="Collateral-free credit facility up to ₹5 Crore with up to 85% credit guarantee coverage provided by the trust.",
            subsidy_percentage="Collateral Guarantee up to 85%",
            max_subsidy_amount="₹5,00,00,000 Credit Facility",
            eligibility_criteria="Manufacturing MSMEs with valid Udyam certificate and bank project financing.",
            required_documents="Business Plan, Quotations for Machinery, Statutory Approvals/NOCs",
            application_url="https://www.cgtmse.in/demo",
            deadline="Open Throughout Year"
        ),
        GovernmentScheme(
            name="Maharashtra Package Scheme of Incentives (PSI - Agro Units)",
            ministry="Industries Department, Government of Maharashtra",
            sector="Food Processing",
            target_stage="SETUP, OPERATIONAL",
            min_investment=3000000.0,
            max_investment=200000000.0,
            benefits_summary="100% stamp duty exemption, electricity duty refund for 7 years, and 5% interest subsidy on term loans for food processing units in Taluka Class B/C/D.",
            subsidy_percentage="5% Interest Subvention + Duty Waivers",
            max_subsidy_amount="₹25,00,000 / Year",
            eligibility_criteria="Units established in notified MIDC industrial belts in Maharashtra.",
            required_documents="MIDC Allotment Letter, Electricity Sanction, CTE from MPCB, FSSAI Registration",
            application_url="https://maitri.mahaonline.gov.in/demo",
            deadline="Valid through 2029"
        )
    ]
    db.add_all(schemes)

    # 9. Initial Notifications
    notifs = [
        Notification(
            user_id=entrepreneur.id,
            title="Document Vault Initialized",
            message="4 statutory business documents are registered in your Vault. 1 document required for Food Processing Registration is missing.",
            category="DOCUMENT",
            link="/documents"
        ),
        Notification(
            user_id=entrepreneur.id,
            title="Approvals Discovery Ready",
            message="Based on your business profile (Food Processing in Maharashtra), 5 regulatory clearances have been identified.",
            category="APPLICATION",
            link="/approvals"
        )
    ]
    db.add_all(notifs)
    db.commit()

    print(">>> Database successfully seeded with demo accounts, business, rules, documents, and schemes!")

if __name__ == "__main__":
    from backend.app.database import engine, Base
    Base.metadata.create_all(bind=engine)
    from backend.app.database import SessionLocal
    db = SessionLocal()
    seed_database(db)
    db.close()
