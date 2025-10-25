import { blogContent } from "@/data/blogs";
import Link from "next/link";

const index = ({ blogId = 1 }) => {
  const content = blogContent[blogId] || [];

  return (
    <div className="auto-container">
      {content.map((item, index) => {
        if (item.type === "heading") {
          return <h4 key={index}>{item.content}</h4>;
        } else if (item.type === "paragraph") {
          return (
            <p key={index}>
              {item.content.split("\n").map((line, lineIndex) => (
                <div key={lineIndex}>
                  {line}
                  {lineIndex < item.content.split("\n").length - 1 && <br />}
                </div>
              ))}
            </p>
          );
        } else if (item.type === "link") {
          // Check if it's an internal link (starts with /) or external link
          const isInternalLink = item.href.startsWith("/");

          if (isInternalLink) {
            return (
              <Link
                key={index}
                href={item.href}
                style={{
                  color: "var(--primary-color)",
                }}
              >
                {item.text}
              </Link>
            );
          } else {
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--primary-color)",
                }}
              >
                {item.text}
              </a>
            );
          }
        }
        return null;
      })}

      {/* <blockquote className="blockquote-style-one mb-5 mt-5">
        <p>
          Aliquam hendrerit sollicitudin purus, quis rutrum mi accumsan nec.
          Quisque bibendum orci ac nibh facilisis, at malesuada orci congue.{" "}
        </p>
        <cite>Luis Pickford</cite>
      </blockquote> */}
      {/* End BlogQuote */}

      {/* <h4>What you&apos;ll learn</h4>
      <ul className="list-style-four">
        <li>Become a UI/UX designer.</li>
        <li>Build a UI project from beginning to end.</li>
        <li>You will be able to start earning money Figma skills.</li>
        <li>Work with colors & fonts.</li>
        <li>You will create your own UI Kit.</li>
        <li>Become a UI/UX designer.</li>
        <li>Build a UI project from beginning to end.</li>
        <li>You will be able to start earning money Figma skills.</li>
        <li>Work with colors & fonts.</li>
        <li>You will create your own UI Kit.</li>
      </ul> */}
      {/* List */}

      {/* <figure className="image">
        <Image
          width={770}
          height={450}
          src="/images/resource/post-img.jpg"
          alt="resource"
        />
      </figure> */}

      {/* <h4>Requirements</h4>
      <ul className="list-style-three">
        <li>
          We do not require any previous experience or pre-defined skills to
          take this course. A great orientation would be enough to master UI/UX
          design.
        </li>
        <li>A computer with a good internet connection.</li>
        <li>Adobe Photoshop (OPTIONAL)</li>
      </ul> */}
      {/* <!-- list --> */}

      <div>
        {/* <div className="social-share">
          <h5>Share this post</h5>
          <SocialShare />
        </div> */}
        {/* End social-share */}

        {/* <Tag /> */}
      </div>
      {/* End other share */}

      {/* <div className="post-control">
        <Pagination />
      </div> */}
      {/* <!-- Post Control --> */}

      {/* <div className="comments-area">
        <CommentBox />
      </div> */}

      {/* <!-- Comments area --> */}

      {/* <!-- Comment Form --> */}
      {/* <div className="comment-form default-form">
        <h4>Leave your thought here</h4>
        <Form />
      </div> */}
      {/* <!--End Comment Form --> */}
    </div>
  );
};

export default index;
