import { React, useState } from "react";
import { Tab } from "@headlessui/react";
import { StarIcon } from "@heroicons/react/20/solid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Function to check if URL is an image
function isImage(url) {
  const extension = url.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension);
}

export default function Post({ data }) {
  // should have the ownerID of the current user
  const ownerID = 1;
  const MAX_CONTENT_LENGTH = 255;

  console.log("data passed", data);

  // data passed:  postid, walkid, dogs[...], ownerid, owner_name, content,
  //               location, date, distance, time, urls[...], tagged_dogs[...]
  //               tags[...], met_up_owners[...], rating

  // what we should be able to edit: dogs, content, location, date, distance, time, tagged_dogs, tags
  // adding met_up_owners: if not a meetup, create a meetup.
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.content);
  const [editedLocation, setEditedLocation] = useState(data.location);
  const [editedDate, setEditedDate] = useState(data.date);
  const [editedDistance, setEditedDistance] = useState(data.distance);
  const [editedRating, setEditedRating] = useState(data.rating);
  const [editedTags, setEditedTags] = useState(data.tags);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleContentChange = (e) => {
    const inputContent = e.target.value;
    if (inputContent.length <= MAX_CONTENT_LENGTH) {
      setEditedContent(inputContent);
    }
  };
  const handleLocationChange = (e) => {
    setEditedLocation(e.target.value);
  };

  const handleStarClick = (clickedRating) => {
    setEditedRating(clickedRating);
  };

  const handleTagsChange = (e) => {
    const inputTags = e.target.value.split(",").map((tag) => tag.trim());
    const uniqueTags = inputTags.filter(
      (tag, index, self) => tag && self.indexOf(tag) === index
    );
    setEditedTags(uniqueTags);
  };

  // will be the same as new post form (but updates)
  // post_walk will handle: content, tags -> based on postid from data
  // walk will handle: date, rating, location ->based on walkid from data
  const handleSubmit = async (e) => {
    e.preventDefault();
    // do post_walk updates first

    try {
      await axios.put(
        `http://localhost:8800/posts/${data.postid}/update-post-content`,
        { content: editedContent }
      );

      // for tags = delete those tags first, then add new tags
      for (const tag in data.tags) {
        await axios.delete(
          `http://localhost:8800/posts/${data.postid}/${tag}/delete-tag`
        );
      }
      for (const tag in editedTags) {
        await axios.post(`http://localhost:8800/posts/${data.postid}/add-tag`, {
          tag: tag,
        });
      }

      console.log("Post edited.");
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          {data.urls.every((url) => !url) ? (
            // Placeholder for no media
            <img
              src="/walkingdog.jpeg"
              alt="Placeholder"
              className="h-full w-full object-cover object-center rounded-lg"
              style={{ aspectRatio: "4/3", width: "100%" }}
            />
          ) : data.urls.filter((url) => url).length === 1 ? (
            // One media: render the media without a gallery
            <>
              {isImage(data.urls[0]) ? (
                // Image
                <img
                  src={`http://localhost:8800/images/${data.urls[0]}`}
                  alt=""
                  className="h-full w-full object-cover object-center rounded-lg"
                  style={{ aspectRatio: "4/3", width: "100%" }}
                />
              ) : (
                // Video
                <video
                  src={`http://localhost:8800/videos/${data.urls[0]}`}
                  alt=""
                  className="h-full w-full object-cover object-center rounded-lg"
                  style={{ aspectRatio: "4/3", width: "100%" }}
                  controls
                />
              )}
            </>
          ) : (
            <Tab.Group as="div" className="flex flex-col-reverse">
              {/* Image selector */}
              <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                <Tab.List className="grid grid-cols-4 gap-6">
                  {data.urls.map((url, index) => (
                    <Tab
                      key={index}
                      className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                    >
                      {({ selected }) => (
                        <>
                          <span className="sr-only">{`Media ${
                            index + 1
                          }`}</span>
                          <span className="absolute inset-0 overflow-hidden rounded-md">
                            {isImage(url) ? (
                              // Image
                              <img
                                src={`http://localhost:8800/images/${url}`}
                                alt={`Media ${index + 1}`}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              // Video
                              <div className="h-full w-full relative">
                                <video
                                  src={`http://localhost:8800/videos/${url}`}
                                  alt={`Media ${index + 1}`}
                                  className="h-full w-full object-cover object-center rounded-lg"
                                  controls
                                />
                                <div className="absolute inset-0 bg-transparent"></div>
                              </div>
                            )}
                          </span>
                          <span
                            className={classNames(
                              selected ? "ring-indigo-500" : "ring-transparent",
                              "pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2"
                            )}
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
              </div>

              <Tab.Panels className="aspect-h-1 aspect-w-1 w-full">
                {data.urls.map((url, index) => (
                  <Tab.Panel key={index}>
                    {isImage(url) ? (
                      // Image
                      <img
                        src={`http://localhost:8800/images/${url}`}
                        alt={`Media ${index + 1}`}
                        className="h-full w-full object-cover object-center rounded-lg"
                        style={{
                          aspectRatio: "4/3",
                          width: "100%",
                        }}
                      />
                    ) : (
                      // Video
                      <video
                        src={`http://localhost:8800/videos/${url}`}
                        alt={`Media ${index + 1}`}
                        className="h-full w-full object-cover object-center rounded-lg"
                        style={{ aspectRatio: "4/3", width: "100%" }}
                        controls
                      />
                    )}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          )}

          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            {/* Post Title */}
            {isEditing ? (
              <>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Edit your post
                </h1>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {data.met_up_owners && data.met_up_owners.length > 0 ? (
                    <>
                      <div>
                        Met up with{" "}
                        {data.met_up_owners.map((owner, index) => (
                          <span key={index}>
                            {owner}
                            {index !== data.met_up_owners.length - 1 &&
                              ", "}{" "}
                          </span>
                        ))}
                      </div>
                      <span className="mt-4 text-xl font-semibold text-gray-800">
                        Along by{" "}
                        {data.dogs.map((dog, index) => (
                          <span key={index}>
                            {dog}
                            {index !== data.dogs.length - 1 && ", "}{" "}
                          </span>
                        ))}
                      </span>
                    </>
                  ) : (
                    <div>
                      Trailing with{" "}
                      {data.dogs.map((dog, index) => (
                        <span key={index}>
                          {dog}
                          {index !== data.dogs.length - 1 && ", "}{" "}
                        </span>
                      ))}
                    </div>
                  )}
                </h1>
                {/* Post Owner */}
                <h2 className="text-lg mt-1 tracking-tight text-gray-700">
                  Post by {data.owner_name}
                </h2>
              </>
            )}

            {/* Walk Rating */}
            <div className="mt-3">
              <h3 className="sr-only">Walk Rating</h3>
              {isEditing ? (
                <div className="flex mx-1 mb-3">
                  <span className="text-gray-400 mr-3 mb-1">Edit rating: </span>
                  {[0, 1, 2, 3, 4].map((star) => (
                    <StarIcon
                      key={star}
                      className={classNames(
                        editedRating > star
                          ? "text-indigo-500"
                          : "text-gray-300",
                        "h-5 w-5 flex-shrink-0 cursor-pointer"
                      )}
                      onClick={() => handleStarClick(star + 1)}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={classNames(
                          data.rating > rating
                            ? "text-indigo-500"
                            : "text-gray-300",
                          "h-5 w-5 flex-shrink-0"
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="sr-only">{data.rating} out of 5 stars</p>
                </div>
              )}
            </div>
            <div className="w-3/5">
              {/* Walk Details */}
              <div className="mt-6">
                {/* Walk Location */}
                {isEditing ? (
                  <div className="flex items-center">
                    <h3 className="text-gray-800 mr-3">Location:</h3>
                    <input
                      type="text"
                      className="w-full text-base text-gray-700 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-blue-400"
                      value={editedLocation}
                      onChange={handleLocationChange}
                    />
                  </div>
                ) : (
                  <span>{data.location}</span>
                )}
                <br />
                {/* Walk Date */}
                {isEditing ? (
                  <div className="flex items-center">
                    <h3 className="text-gray-800 mr-3">Date:</h3>
                    <DatePicker
                      selected={editedDate}
                      onChange={(date) => setEditedDate(date)}
                      dateFormat="yyyy-MM-dd"
                      className="w-full border border-gray-300 text-gray-900 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-blue-400"
                      placeholderText="YYYY-MM-DD"
                      isClearable
                    />
                  </div>
                ) : (
                  data.date && (
                    <span>{new Date(data.date).toLocaleDateString()}</span>
                  )
                )}
                {data.time && <span>{data.time}</span>}
                <br />
                {/* Walk Distance */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedDistance}
                    placeholder="distance (km)"
                    onChange={(dist) => setEditedDistance(dist)}
                    className="w-full border border-gray-300 text-gray-900 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-blue-400"
                  />
                ) : (
                  data.distance && <span>{data.distance} kilometers</span>
                )}
                {/* Post Content */}
                <h3 className="sr-only">Post Content</h3>
                {isEditing ? (
                  <div className="py-4 text-base text-gray-700">
                    <textarea
                      className="w-full border border-gray-300 rounded-md pl-3 pt-3 pr-6 focus:outline-none focus:ring focus:border-blue-400"
                      value={editedContent}
                      maxLength={MAX_CONTENT_LENGTH}
                      onChange={handleContentChange}
                      onKeyDown={(e) => {
                        if (
                          editedContent.length >= MAX_CONTENT_LENGTH &&
                          e.key !== "Backspace"
                        ) {
                          e.preventDefault(); // Prevent typing when max limit is reached
                        }
                      }}
                    />
                    <div className="text-gray-500 text-xs ml-auto text-right">
                      {MAX_CONTENT_LENGTH - editedContent.length} characters
                      remaining
                    </div>
                  </div>
                ) : (
                  <div
                    className="space-y-6 mt-6 py-4 text-base text-gray-700"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                  />
                )}
                {/* Dog Tags*/}
                <div className="mt-4">
                  {data.tagged_dogs && data.tagged_dogs.length > 0 && (
                    <>
                      <span>Spotted Dogs: </span>
                      {data.tagged_dogs.map((dog, index) => (
                        <span key={index}>
                          {dog}
                          {index < data.tagged_dogs.length - 1 && ", "}{" "}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                {/* Post Tags */}
                {isEditing ? (
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3 mb-5">Tags: </span>
                    <input
                      type="text"
                      placeholder="Place your tags here. Add commas (', ') to separate!"
                      value={editedTags.join(",")}
                      onChange={handleTagsChange}
                      className="w-full border border-gray-300 text-gray-900 rounded-md py-2 px-3 mb-3 focus:outline-none focus:ring focus:border-blue-400"
                    />
                  </div>
                ) : (
                  <div className="mt-0 lg:mt-12">
                    {data.tags.map((tag, index) => (
                      <a
                        href={`http://localhost:3000/post/${tag}`}
                        key={index}
                        className="bg-stone-200 text-stone-900 rounded-lg px-2 py-1 mr-2 mt-1"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* if the owner of the post is in the post page, they should be able to delete or edit the post */}
            {data.ownerid === ownerID &&
              (!isEditing ? (
                <button
                  className="text-xs text-gray-500 py-3 mt-4"
                  onClick={handleEditClick}
                >
                  edit post
                </button>
              ) : (
                <div className="flex items-center text-xs text-gray-500 py-3 mt-4">
                  <button className="mr-5" onClick={handleEditClick}>
                    cancel
                  </button>
                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      className="mx-auto w-30 bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-400"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
