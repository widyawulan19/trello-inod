{Array.isArray(summaries) && summaries.map((item) => (
  <div key={item.id}>{item.text}</div>
))}