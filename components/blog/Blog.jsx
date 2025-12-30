import Link from "next/link";
import blogContent from "../../data/blogs";
import Image from "next/image";

const Blog = () => {
  return (
    <>
      {blogContent.slice(0, 4).map((item) => (
        <div
          className="news-block col-lg-3 col-md-6 col-sm-12"
          key={item.id}
        >
          <div className="inner-box">
            <div className="image-box">
              <figure className="image">
                <Image
                  width={391}
                  height={258}
                  layout="responsive"
                  src={item.img}
                  alt={item.title}
                />
              </figure>
            </div>

            <div className="lower-content">
              <ul className="post-meta">
                <li>{item?.date}</li>
              </ul>

              <h3>
                <Link href={`/blog-details/${item.id}`}>
                  {item.title}
                </Link>
              </h3>

              <p className="text">{item.blogText}</p>

              <Link
                href={`/blog-details/${item.id}`}
                className="read-more"
              >
                Lees Meer <i className="fa fa-angle-right"></i>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Blog;
