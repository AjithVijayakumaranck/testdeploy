import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../../../Components/Navbar/Navbar'
import Footer from '../../../Components/Footer/Footer'
import ClientProfiles from '../../../Components/Profile/ClientProfile'
import Style from './Style.module.css'
import { useParams } from 'react-router-dom'
import instance from '../../../instance/AxiosInstance'
import { BsFillReplyFill } from 'react-icons/bs';
import { AiOutlineStar } from "react-icons/ai";
import Swal from 'sweetalert2'
import { FaStar } from 'react-icons/fa'
import { UserContext } from '../../../Contexts/UserContext'
import Star from '../../../Components/ReviewStars/Star';
import adminInstance from '../../../instance/AdminInstance'
import authInstance from '../../../instance/AuthInstance'
import OwnCard from '../../../Components/Cards/OwnProductCard/OwnCard'



const ClientProfilePage = () => {

    const { clientId } = useParams();
    const LoggedInUser = useContext(UserContext);
    const { User } = LoggedInUser

    const [ClientData, SetClientData] = useState({})
    const [ClientAddress, SetClientAddress] = useState({});
    const [ClientProducts, SetClientProducts] = useState([]);
    const [ClientImage, SetClientImage] = useState("");
    const [TotalRating, SetTotalRating] = useState(0)
    const [Toggle, SetToggle] = useState(false);
    const [Comments, SetComments] = useState("");
    const [CurrentPage, SetCurrentPage] = useState(0);
    const [Rating, SetRating] = useState(0);
    const [Reviews, SetReviews] = useState([]);
    const [Reload, SetReload] = useState(false);
   



    function ScrollToTopOnMount() {
        useEffect(() => {
            window.scrollTo(0, 0);
        }, []);

        return null;
    }

    const loadClient = () => {
        try {
            instance.get(`/api/user/profile/get_profile/${clientId}`).then((Response) => {
                //console.log(Response.data, "client details");
                SetClientData({ ...Response.data })
                SetClientAddress({ ...Response.data.address });
                SetClientImage(Response.data.profilePicture.url);
            }).catch((err) => {
                console.log(err)
            });
        } catch (error) {
            console.log(error);
        }
    };

    const loadClientProducts = () => {
        try {
            adminInstance.get(`/api/super_admin/product_control/get_userproducts/${clientId}`).then((response) => {
                //console.log(response.data, "user products res");
                SetClientProducts(response.data);
            }).catch((error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleShowmore = () => {
        console.log("hello next");
        SetCurrentPage(CurrentPage + 12);
    }


    const loadReview = () => {
        try {
            instance.get(`/api/user/profile/get_rating?userId=${clientId}&&page=${CurrentPage}`).then((response) => {
                //console.log(response.data, "getting review");
                SetReviews(response.data.ratings)
                SetTotalRating(response.data.totalrating)
            })
        } catch (error) {
            console.log(error);
        }
    }




    //Handle Reply
    const handleReply = (reviewId) => {
        console.log(reviewId._id,"userId:", User._id, "review id");
        const { value: text } = Swal.fire({
            input: 'textarea',
            inputLabel: 'Message',
            inputPlaceholder: 'Type your message here...',
            inputAttributes: {
                'aria-label': 'Type your message here'
            },
            showCancelButton: true,
            confirmButtonColor: '#046BD2',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (!result.dismiss && result.value) {
                const text = result.value;
                console.log(text,  "text in reply");
                // Make API request here
                try {
                    authInstance.post("/api/user/profile/add_reply", { reviewerId: User._id, senderId: reviewId._id, reply: text }).then((response) => {
                        //console.log(response.data);
                        SetReload(true)
                        Swal.fire("Replied Sucessfully");

                    }).catch((err) => {
                        console.log(err);
                    })
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }

    // ---- Rating components ------
    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("userId:", User._id, "RevewierId:", clientId, Rating, Comments, "rating and comments");
        try {
            authInstance.post("/api/user/profile/profile_rating", { userId: clientId, ratingId: User._id, star: Rating, comment: Comments }).then((response) => {
                console.log(response.data);
                SetRating(0);
                SetComments("")
                SetToggle(false)
                SetReload(true)
            }).catch((err) => {
                console.log(err);
            })
        } catch (error) {
            console.log(error);
        }
    }



    //LoadCategory functions
    useEffect(() => {
        loadClient();
        loadClientProducts();
        loadReview();
    }, [Reload]);




    return (
        <>
            <Navbar />
            <ScrollToTopOnMount />

            <div className={Style.Main_container} >
                <div className={Style.container}>

                    {Toggle ?
                        <div className={Style.popup}>
                            <div className={Style.content}>
                                <div className={Style.Title}>
                                    <h3>Share Your Thoughts: User Reviews and Ratings</h3>
                                </div>
                                <div className={Style.ratingstars}>
                                    {Array(5).fill().map((_, index) => {
                                        return (
                                            Rating >= index + 1 ? (<FaStar style={{ color: 'gold' }} onClick={() => SetRating(index + 1)} />)
                                                : (<AiOutlineStar style={{ color: 'gold' }} onClick={() => SetRating(index + 1)} />)
                                        )
                                    })}
                                </div>
                                <div className={Style.textBox}>
                                    <textarea name="review"
                                        id="review"
                                        placeholder='Leave a comment...'
                                        cols="30"
                                        rows="5"
                                        value={Comments}
                                        onChange={(e) => { SetComments(e.target.value) }}
                                    />
                                </div>
                                <div className={Style.btnBox}>
                                    <button onClick={(e) => handleSubmit(e)}>Submit</button>
                                    <button onClick={() => SetToggle(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                        : null
                    }


                    <ClientProfiles profile={ClientData} profileaddress={ClientAddress} image={ClientImage} />

                    <div className={Style.ad_container} >
                        <OwnCard products={ClientProducts} UserId={User._id} />
                    </div>

                    <div className={Style.review_container} >

                        <div className={Style.left} >
                            <div className={Style.top} >
                                <div className={Style.Rating_wrap}>
                                    <div className={Style.rating} >
                                        <h1>{TotalRating}</h1>
                                    </div>
                                    <div className={Style.Icon_wrap}>
                                        <div className={Style.ratingIcon}>
                                            <Star stars={TotalRating} />
                                        </div>
                                        <p>({Reviews.length} Reviews)</p>
                                    </div>
                                </div>
                            </div>
                            <div className={Style.bottom} >
                                <div className={Style.title}>
                                    <h4>Rate and Review</h4>
                                </div>
                                <div className={Style.Btn_wrap} >
                                    <button className={Style.WriteBtn} onClick={() => SetToggle(true)} >Write Review</button>
                                </div>
                            </div>
                        </div>

                        <div className={Style.right} >
                            <div className={Style.top} >
                                <h3>Reviews</h3>
                            </div>
                            <div className={Style.bottom} >

                                {Reviews.map((reviews, index) => {
                                    console.log(reviews, "return reviews");
                                    return (
                                        <div className={Style.reviews_wrap} >
                                            <div className={Style.Image_wrap} >
                                                <img
                                                    src={
                                                        reviews
                                                            ? reviews.postedby.profilePicture.url
                                                            : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                                                    }
                                                    alt=""
                                                />
                                            </div>
                                            <div className={Style.Det_wrap} >
                                                <div className={Style.Id}>
                                                    <label>{reviews.postedby.fullname}</label>
                                                    <span onClick={() => { handleReply(reviews.postedby) }}><BsFillReplyFill /> Reply </span>
                                                </div>
                                                <div className={Style.Message} >
                                                    <div className={Style.Send}>
                                                        <p>{reviews.comment}</p>
                                                    </div>

                                                    {reviews.reply.map((replys, index) => {
                                                        // console.log(replys, "return replys");
                                                        return (
                                                            <div className={Style.Reply}>
                                                                <p> <span>Reply : </span> {replys.content} </p>
                                                            </div>
                                                        )
                                                    })}

                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}



                                {/* <div className={Style.none_wrap} >
                                    <button onClick={(e) => handlePreviousPage(e)} disabled={CurrentPage === 0} > <RxDoubleArrowLeft className={Style.icon} /> </button>
                                    <button onClick={(e) => handleNextPage(e)}  > <RxDoubleArrowRight className={Style.icon} /> </button>
                                </div> */}

                                {CurrentPage === 0 ?
                                    <div className={Style.none_wrap} >
                                        No More Reviews
                                    </div> :
                                    <div className={Style.none_wrap} onClick={handleShowmore()}>
                                        Show more
                                    </div>
                                }

                            </div>
                        </div>
                    </div>



                </div>
            </div >
            <Footer />
        </>
    )
}

export default ClientProfilePage