export const formatCurrency = (n: number | null | undefined) =>
  `PKR ${n?.toLocaleString('en-PK') ?? 0}`

export const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
