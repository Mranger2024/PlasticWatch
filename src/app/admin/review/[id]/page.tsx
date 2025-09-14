import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ReviewForm from "@/components/review-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

async function getContribution(id: string) {
    const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) {
        return null;
    }
    return data;
}

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ReviewPage({
  params,
}: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const contribution = await getContribution(id);

    if (!contribution) {
        notFound();
    }

    return (
        <div className="container py-12">
            <div className="mb-8">
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Review Contribution</CardTitle>
                    <CardDescription>Verify the details and classify the item.</CardDescription>
                </CardHeader>
                <ReviewForm contribution={contribution} />
            </Card>
        </div>
    );
}
