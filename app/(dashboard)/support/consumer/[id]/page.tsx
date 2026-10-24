import SupportHub from '@/components/support-hub'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SupportHub initialTicketId={id} />
}
