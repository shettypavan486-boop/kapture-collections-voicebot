const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// =====================================================
// MOCK CUSTOMER DATABASE
// =====================================================

const customers = {
    "ACC-88392": {
        customer_name: "Rahul Sharma",
        verification_codes: ["1234", "1995"],
        loan_type: "Personal Loan",
        overdue_amount: 8499,
        days_past_due: 12
    }
};

// =====================================================
// MOCK STORAGE
// =====================================================

// Stores Promise-to-Pay records
const promiseToPays = [];

// Stores final call dispositions
const dispositions = [];

// Stores payment-link requests
const paymentLinks = [];

// Stores escalations
const escalations = [];


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "Kapture Collections Mock Server"
    });
});


// =====================================================
// VIEW STORED PTP RECORDS
// =====================================================

app.get("/ptps", (req, res) => {

    res.json({
        success: true,
        count: promiseToPays.length,
        records: promiseToPays
    });

});


// =====================================================
// VIEW STORED DISPOSITIONS
// =====================================================

app.get("/dispositions", (req, res) => {

    res.json({
        success: true,
        count: dispositions.length,
        records: dispositions
    });

});


// =====================================================
// VIEW PAYMENT LINK RECORDS
// =====================================================

app.get("/payment-links", (req, res) => {

    res.json({
        success: true,
        count: paymentLinks.length,
        records: paymentLinks
    });

});


// =====================================================
// VIEW ESCALATION RECORDS
// =====================================================

app.get("/escalations", (req, res) => {

    res.json({
        success: true,
        count: escalations.length,
        records: escalations
    });

});


// =====================================================
// VAPI WEBHOOK
// =====================================================

app.post("/webhook", (req, res) => {

    console.log("\n======================================");
    console.log("          VAPI REQUEST RECEIVED");
    console.log("======================================");

    console.log(JSON.stringify(req.body, null, 2));

    const message = req.body.message;


    // =================================================
    // HANDLE VAPI TOOL CALLS
    // =================================================

    if (message && message.type === "tool-calls") {

        const toolCalls = message.toolCalls || [];

        const results = toolCalls.map((toolCall) => {

            const functionName = toolCall.function.name;

            let args = toolCall.function.arguments || {};

            // -----------------------------------------
            // Handle arguments if Vapi sends a string
            // -----------------------------------------

            if (typeof args === "string") {

                try {
                    args = JSON.parse(args);
                } catch (error) {

                    console.error(
                        "Failed to parse tool arguments:",
                        args
                    );

                    return {
                        toolCallId: toolCall.id,
                        result: JSON.stringify({
                            success: false,
                            message: "Invalid tool arguments."
                        })
                    };
                }
            }


            console.log("\n--------------------------------------");
            console.log("Tool:", functionName);
            console.log("Arguments:", args);
            console.log("--------------------------------------");


            let result;


            // =================================================
            // VERIFY CUSTOMER
            // =================================================

            switch (functionName) {

                case "verify_customer": {

                    const customer =
                        customers[args.account_id];

                    if (!customer) {

                        result = {
                            verified: false,
                            message:
                                "Customer account not found."
                        };

                        break;
                    }


                    const isValid =
                        customer.verification_codes.includes(
                            String(args.verification_code)
                        );


                    if (isValid) {

                        result = {
                            verified: true,
                            customer_name:
                                customer.customer_name,
                            message:
                                "Identity verified successfully."
                        };

                    } else {

                        result = {
                            verified: false,
                            message:
                                "Verification failed. Incorrect verification code."
                        };

                    }

                    break;
                }


                // =================================================
                // LOG PROMISE TO PAY
                // =================================================

                case "log_promise_to_pay": {

                    const ptpId =
                        `PTP-${Math.floor(
                            1000 + Math.random() * 9000
                        )}`;


                    const ptpRecord = {

                        ptp_id: ptpId,

                        account_id:
                            args.account_id,

                        confirmed_date:
                            args.ptp_date,

                        amount:
                            Number(args.amount),

                        created_at:
                            new Date().toISOString()

                    };


                    // -----------------------------------------
                    // STORE RECORD
                    // -----------------------------------------

                    promiseToPays.push(ptpRecord);


                    console.log(
                        "\n========== PTP STORED =========="
                    );

                    console.log(
                        JSON.stringify(
                            ptpRecord,
                            null,
                            2
                        )
                    );


                    result = {

                        success: true,

                        ...ptpRecord,

                        message:
                            "Promise to pay successfully recorded."

                    };


                    break;
                }


                // =================================================
                // SEND PAYMENT LINK
                // =================================================

                case "send_payment_link": {

                    const paymentLinkRecord = {

                        account_id:
                            args.account_id,

                        channel:
                            args.channel,

                        created_at:
                            new Date().toISOString()

                    };


                    paymentLinks.push(
                        paymentLinkRecord
                    );


                    console.log(
                        "\n========== PAYMENT LINK STORED =========="
                    );

                    console.log(
                        JSON.stringify(
                            paymentLinkRecord,
                            null,
                            2
                        )
                    );


                    result = {

                        success: true,

                        ...paymentLinkRecord,

                        message:
                            `Payment link sent successfully via ${args.channel}.`

                    };


                    break;
                }


                // =================================================
                // ESCALATE TO HUMAN AGENT
                // =================================================

                case "escalate_to_agent": {

                    const escalationRecord = {

                        escalation_id:
                            `ESC-${Math.floor(
                                1000 + Math.random() * 9000
                            )}`,

                        reason:
                            args.reason,

                        account_id:
                            args.account_id || null,

                        created_at:
                            new Date().toISOString()

                    };


                    escalations.push(
                        escalationRecord
                    );


                    console.log(
                        "\n========== ESCALATION STORED =========="
                    );

                    console.log(
                        JSON.stringify(
                            escalationRecord,
                            null,
                            2
                        )
                    );


                    result = {

                        success: true,

                        ...escalationRecord,

                        message:
                            "The call has been escalated to a human agent."

                    };


                    break;
                }


                // =================================================
                // MARK DISPOSITION
                // =================================================

                case "mark_disposition": {

                    const dispositionRecord = {

                        account_id:
                            args.account_id,

                        status:
                            args.status,

                        notes:
                            args.notes || "",

                        timestamp:
                            new Date().toISOString()

                    };


                    // -----------------------------------------
                    // STORE DISPOSITION
                    // -----------------------------------------

                    dispositions.push(
                        dispositionRecord
                    );


                    console.log(
                        "\n========== DISPOSITION STORED =========="
                    );

                    console.log(
                        JSON.stringify(
                            dispositionRecord,
                            null,
                            2
                        )
                    );


                    result = {

                        success: true,

                        ...dispositionRecord,

                        message:
                            "Disposition successfully recorded."

                    };


                    break;
                }


                // =================================================
                // UNKNOWN TOOL
                // =================================================

                default: {

                    console.error(
                        "Unknown function:",
                        functionName
                    );


                    result = {

                        success: false,

                        message:
                            `Unknown function: ${functionName}`

                    };

                }

            }


            // =================================================
            // RETURN RESULT TO VAPI
            // =================================================

            return {

                toolCallId:
                    toolCall.id,

                result:
                    JSON.stringify(result)

            };

        });


        // =================================================
        // SEND TOOL RESULTS BACK TO VAPI
        // =================================================

        return res.status(200).json({

            results

        });

    }


    // =================================================
    // HANDLE OTHER VAPI EVENTS
    // =================================================

    return res.status(200).json({

        status: "acknowledged"

    });

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Kapture Mock Server running on http://localhost:${PORT}`
    );

});