import blogContent from "../../data/blogs";

const Blog8 = () => {
  return (
    <>
      {blogContent.slice(0, 6).map((item) => (
        <div className="col-lg-4 col-md-6 col-sm-12 news-block" key={item.id}>
          <div className="news-block-one wow fadeInUp" data-wow-delay="300ms">
            <div className="inner-box">
              <div className="image-box">
                <figure className="image">
                  <a href={`/blog-details/${item.id}`}>
                    <img src={item.img} alt="" />
                  </a>
                </figure>
                <div className="date">{item.date}</div>
              </div>
              <div className="lower-content">
                <div className="category">{item.category}</div>
                <h4>
                  <a href={`/blog-details/${item.id}`}>{item.title}</a>
                </h4>
                <div className="text">{item.text}</div>
                <div className="author-info">
                  <div className="author-thumb">
                    <img src={item.authorImg} alt="" />
                  </div>
                  <div className="author-name">
                    <a href="#">{item.author}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Blog8;
