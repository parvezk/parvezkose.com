import Footer from "app/components/footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-black bg-white dark:text-white dark:bg-black">
      <div className="max-w-xl mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
