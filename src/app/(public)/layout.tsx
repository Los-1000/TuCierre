export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:bg-[#2855E0] focus:rounded-lg focus:shadow-lg"
      >
        Ir al contenido principal
      </a>
      {children}
    </>
  )
}
