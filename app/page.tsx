import { BlogPosts } from "app/components/posts";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Parvez Kose
      </h1>
      <p className="mb-4">
        {`Hello, I’m a Staff Software Engineer focussed on building intuitive and responsive digital experiences.`}
      </p>
      <p className="mb-4">
        {`I love turning ideas into tangible products, prototyping user interfaces and web animations that push the envelope of what's possible and adds a level of craftsmanship to the site. I’m passionate about interaction design, visualization and building immersive product experiences. `}
      </p>
      <div className="my-8">{/* <BlogPosts /> */}</div>
    </section>
  );
}
