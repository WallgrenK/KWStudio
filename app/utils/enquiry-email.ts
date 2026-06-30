import { supabase } from "~/utils/supabase";

type EnquiryEmailPayload = {
    name: string;
    email: string;
    company?: string | null;
    budget?: string | null;
    message: string;
    source: "contact" | "start-a-project";
    enquiryId?: string | null;
};

export async function notifyEnquiryEmail(payload: EnquiryEmailPayload) {
    try {
        const { error } = await supabase.functions.invoke("send-email", {
            body: {
                ...payload,
                submittedAt: new Date().toISOString(),
            },
        });

        if (error) {
            console.error("Could not send enquiry email notification.", error);
        }
    } catch (error) {
        console.error("Could not send enquiry email notification.", error);
    }
}
