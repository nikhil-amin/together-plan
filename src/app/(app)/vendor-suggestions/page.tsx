import { VendorSuggestionForm } from '@/components/vendor-suggestions/VendorSuggestionForm';

export default function VendorSuggestionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline text-primary mb-6">Vendor Suggestions</h1>
      <VendorSuggestionForm />
    </div>
  );
}
