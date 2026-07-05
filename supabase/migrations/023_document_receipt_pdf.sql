-- Signed receipt PDF artifacts (Part 11)

alter table public.document_render_artifacts drop constraint if exists document_render_artifacts_target_check;
alter table public.document_render_artifacts
  add constraint document_render_artifacts_target_check check (
    render_target in ('html', 'pdf', 'email', 'receipt_pdf')
  );
