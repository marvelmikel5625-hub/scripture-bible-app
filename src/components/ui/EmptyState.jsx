import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EmptyState({ icon, title, description, actionLabel, actionLink }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-2xl font-serif font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        {actionLabel && actionLink && (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            {actionLabel} <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
