export interface PostalRecord {
  pincode: string;
  postOffice: string;
  district: string;
  state: string;
  city: string;
}

export const INITIAL_POSTAL_CODES: PostalRecord[] = [
  // Madhya Pradesh - Indore (Fashion Point Headquarters & Hubs)
  { pincode: '452001', postOffice: 'Indore G.P.O.', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452001', postOffice: 'Indore Cloth Market', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452001', postOffice: 'Vallabh Nagar S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452001', postOffice: 'Siyaganj S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452002', postOffice: 'Indore Collectorate S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452002', postOffice: 'Mhow Naka S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452002', postOffice: 'Chhatribagh S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452003', postOffice: 'Pardeshipura S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452010', postOffice: 'Vijay Nagar S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452010', postOffice: 'Scheme 54 B.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452010', postOffice: 'Bhamori B.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452011', postOffice: 'Nanda Nagar S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '452012', postOffice: 'Rajendra Nagar S.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Indore' },
  { pincode: '453441', postOffice: 'Mhow Cantt H.O', district: 'Indore', state: 'Madhya Pradesh', city: 'Mhow' },

  // Madhya Pradesh - Bhopal & Other Cities
  { pincode: '462001', postOffice: 'Bhopal G.P.O.', district: 'Bhopal', state: 'Madhya Pradesh', city: 'Bhopal' },
  { pincode: '462001', postOffice: 'Shahjahanabad S.O', district: 'Bhopal', state: 'Madhya Pradesh', city: 'Bhopal' },
  { pincode: '462001', postOffice: 'Sultania Road S.O', district: 'Bhopal', state: 'Madhya Pradesh', city: 'Bhopal' },
  { pincode: '462003', postOffice: 'Bairagarh S.O', district: 'Bhopal', state: 'Madhya Pradesh', city: 'Bhopal' },
  { pincode: '462016', postOffice: 'Arera Colony S.O', district: 'Bhopal', state: 'Madhya Pradesh', city: 'Bhopal' },
  { pincode: '462023', postOffice: 'Habibganj S.O', district: 'Bhopal', state: 'Madhya Pradesh', city: 'Bhopal' },
  { pincode: '482001', postOffice: 'Jabalpur H.O', district: 'Jabalpur', state: 'Madhya Pradesh', city: 'Jabalpur' },
  { pincode: '474001', postOffice: 'Gwalior H.O', district: 'Gwalior', state: 'Madhya Pradesh', city: 'Gwalior' },
  { pincode: '456001', postOffice: 'Ujjain H.O', district: 'Ujjain', state: 'Madhya Pradesh', city: 'Ujjain' },
  { pincode: '456010', postOffice: 'Madhav Nagar S.O', district: 'Ujjain', state: 'Madhya Pradesh', city: 'Ujjain' },

  // Delhi NCR
  { pincode: '110001', postOffice: 'New Delhi G.P.O.', district: 'Central Delhi', state: 'Delhi', city: 'New Delhi' },
  { pincode: '110001', postOffice: 'Connaught Place S.O', district: 'Central Delhi', state: 'Delhi', city: 'New Delhi' },
  { pincode: '110001', postOffice: 'Parliament Street S.O', district: 'Central Delhi', state: 'Delhi', city: 'New Delhi' },
  { pincode: '110006', postOffice: 'Chandni Chowk H.O', district: 'North Delhi', state: 'Delhi', city: 'Delhi' },
  { pincode: '110006', postOffice: 'Fatehpuri S.O', district: 'North Delhi', state: 'Delhi', city: 'Delhi' },
  { pincode: '110006', postOffice: 'Jama Masjid S.O', district: 'North Delhi', state: 'Delhi', city: 'Delhi' },
  { pincode: '110019', postOffice: 'Kalkaji H.O', district: 'South East Delhi', state: 'Delhi', city: 'New Delhi' },
  { pincode: '110019', postOffice: 'Nehru Place S.O', district: 'South East Delhi', state: 'Delhi', city: 'New Delhi' },
  { pincode: '110024', postOffice: 'Lajpat Nagar S.O', district: 'South Delhi', state: 'Delhi', city: 'New Delhi' },
  { pincode: '110092', postOffice: 'Anand Vihar S.O', district: 'East Delhi', state: 'Delhi', city: 'Delhi' },
  { pincode: '122001', postOffice: 'Gurgaon H.O', district: 'Gurugram', state: 'Haryana', city: 'Gurugram' },
  { pincode: '201301', postOffice: 'Noida Sector 1 H.O', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', city: 'Noida' },

  // Maharashtra - Mumbai & Pune
  { pincode: '400001', postOffice: 'Mumbai G.P.O.', district: 'Mumbai', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400001', postOffice: 'Fort S.O', district: 'Mumbai', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400001', postOffice: 'Bazargate S.O', district: 'Mumbai', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400002', postOffice: 'Kalbadevi H.O', district: 'Mumbai', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400050', postOffice: 'Bandra West S.O', district: 'Mumbai Suburban', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400050', postOffice: 'Bandra Bazaar S.O', district: 'Mumbai Suburban', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400051', postOffice: 'Bandra East S.O', district: 'Mumbai Suburban', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400076', postOffice: 'Powai S.O', district: 'Mumbai Suburban', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '400069', postOffice: 'Andheri East S.O', district: 'Mumbai Suburban', state: 'Maharashtra', city: 'Mumbai' },
  { pincode: '411001', postOffice: 'Pune H.O', district: 'Pune', state: 'Maharashtra', city: 'Pune' },
  { pincode: '411001', postOffice: 'Camp S.O', district: 'Pune', state: 'Maharashtra', city: 'Pune' },
  { pincode: '411004', postOffice: 'Deccan Gymkhana S.O', district: 'Pune', state: 'Maharashtra', city: 'Pune' },
  { pincode: '411057', postOffice: 'Hinjawadi S.O', district: 'Pune', state: 'Maharashtra', city: 'Pune' },
  { pincode: '440001', postOffice: 'Nagpur G.P.O.', district: 'Nagpur', state: 'Maharashtra', city: 'Nagpur' },

  // Karnataka - Bengaluru
  { pincode: '560001', postOffice: 'Bengaluru G.P.O.', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },
  { pincode: '560001', postOffice: 'Cubbon Road S.O', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },
  { pincode: '560001', postOffice: 'Vidhana Soudha S.O', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },
  { pincode: '560034', postOffice: 'Koramangala 6th Block S.O', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },
  { pincode: '560034', postOffice: 'ST Bed B.O', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },
  { pincode: '560038', postOffice: 'Indiranagar S.O', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },
  { pincode: '560066', postOffice: 'Whitefield S.O', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },
  { pincode: '560100', postOffice: 'Electronic City S.O', district: 'Bengaluru Urban', state: 'Karnataka', city: 'Bengaluru' },

  // Tamil Nadu - Chennai
  { pincode: '600001', postOffice: 'Chennai G.P.O.', district: 'Chennai', state: 'Tamil Nadu', city: 'Chennai' },
  { pincode: '600001', postOffice: 'George Town S.O', district: 'Chennai', state: 'Tamil Nadu', city: 'Chennai' },
  { pincode: '600001', postOffice: 'Muthialpet S.O', district: 'Chennai', state: 'Tamil Nadu', city: 'Chennai' },
  { pincode: '600004', postOffice: 'Mylapore H.O', district: 'Chennai', state: 'Tamil Nadu', city: 'Chennai' },
  { pincode: '600017', postOffice: 'T Nagar H.O', district: 'Chennai', state: 'Tamil Nadu', city: 'Chennai' },
  { pincode: '641001', postOffice: 'Coimbatore H.O', district: 'Coimbatore', state: 'Tamil Nadu', city: 'Coimbatore' },

  // West Bengal - Kolkata
  { pincode: '700001', postOffice: 'Kolkata G.P.O.', district: 'Kolkata', state: 'West Bengal', city: 'Kolkata' },
  { pincode: '700001', postOffice: 'Dalhousie S.O', district: 'Kolkata', state: 'West Bengal', city: 'Kolkata' },
  { pincode: '700001', postOffice: 'BBD Bagh S.O', district: 'Kolkata', state: 'West Bengal', city: 'Kolkata' },
  { pincode: '700007', postOffice: 'Barabazar H.O', district: 'Kolkata', state: 'West Bengal', city: 'Kolkata' },
  { pincode: '700020', postOffice: 'Bhawanipur S.O', district: 'Kolkata', state: 'West Bengal', city: 'Kolkata' },
  { pincode: '700091', postOffice: 'Salt Lake Sector 5 S.O', district: 'North 24 Parganas', state: 'West Bengal', city: 'Kolkata' },

  // Telangana - Hyderabad
  { pincode: '500001', postOffice: 'Hyderabad G.P.O.', district: 'Hyderabad', state: 'Telangana', city: 'Hyderabad' },
  { pincode: '500001', postOffice: 'Abids S.O', district: 'Hyderabad', state: 'Telangana', city: 'Hyderabad' },
  { pincode: '500001', postOffice: 'Troop Bazaar S.O', district: 'Hyderabad', state: 'Telangana', city: 'Hyderabad' },
  { pincode: '500003', postOffice: 'Secunderabad H.O', district: 'Hyderabad', state: 'Telangana', city: 'Secunderabad' },
  { pincode: '500081', postOffice: 'Madhapur S.O', district: 'K.V.Rangareddy', state: 'Telangana', city: 'Hyderabad' },
  { pincode: '500033', postOffice: 'Jubilee Hills S.O', district: 'Hyderabad', state: 'Telangana', city: 'Hyderabad' },

  // Rajasthan - Jaipur
  { pincode: '302001', postOffice: 'Jaipur G.P.O.', district: 'Jaipur', state: 'Rajasthan', city: 'Jaipur' },
  { pincode: '302001', postOffice: 'C-Scheme S.O', district: 'Jaipur', state: 'Rajasthan', city: 'Jaipur' },
  { pincode: '302001', postOffice: 'M.I. Road S.O', district: 'Jaipur', state: 'Rajasthan', city: 'Jaipur' },
  { pincode: '302015', postOffice: 'Malviya Nagar S.O', district: 'Jaipur', state: 'Rajasthan', city: 'Jaipur' },
  { pincode: '302020', postOffice: 'Mansarovar S.O', district: 'Jaipur', state: 'Rajasthan', city: 'Jaipur' },
  { pincode: '342001', postOffice: 'Jodhpur H.O', district: 'Jodhpur', state: 'Rajasthan', city: 'Jodhpur' },

  // Uttar Pradesh - Lucknow & Kanpur
  { pincode: '226001', postOffice: 'Lucknow G.P.O.', district: 'Lucknow', state: 'Uttar Pradesh', city: 'Lucknow' },
  { pincode: '226001', postOffice: 'Hazratganj S.O', district: 'Lucknow', state: 'Uttar Pradesh', city: 'Lucknow' },
  { pincode: '226001', postOffice: 'Lalbagh S.O', district: 'Lucknow', state: 'Uttar Pradesh', city: 'Lucknow' },
  { pincode: '226010', postOffice: 'Gomti Nagar S.O', district: 'Lucknow', state: 'Uttar Pradesh', city: 'Lucknow' },
  { pincode: '208001', postOffice: 'Kanpur H.O', district: 'Kanpur Nagar', state: 'Uttar Pradesh', city: 'Kanpur' },
  { pincode: '221001', postOffice: 'Varanasi Cantt H.O', district: 'Varanasi', state: 'Uttar Pradesh', city: 'Varanasi' },
  { pincode: '282001', postOffice: 'Agra Fort H.O', district: 'Agra', state: 'Uttar Pradesh', city: 'Agra' },

  // Gujarat - Ahmedabad & Surat
  { pincode: '380001', postOffice: 'Ahmedabad G.P.O.', district: 'Ahmedabad', state: 'Gujarat', city: 'Ahmedabad' },
  { pincode: '380001', postOffice: 'Bhadra S.O', district: 'Ahmedabad', state: 'Gujarat', city: 'Ahmedabad' },
  { pincode: '380001', postOffice: 'Relief Road S.O', district: 'Ahmedabad', state: 'Gujarat', city: 'Ahmedabad' },
  { pincode: '380015', postOffice: 'Satellite S.O', district: 'Ahmedabad', state: 'Gujarat', city: 'Ahmedabad' },
  { pincode: '380054', postOffice: 'Thaltej S.O', district: 'Ahmedabad', state: 'Gujarat', city: 'Ahmedabad' },
  { pincode: '395001', postOffice: 'Surat H.O', district: 'Surat', state: 'Gujarat', city: 'Surat' },
  { pincode: '390001', postOffice: 'Vadodara H.O', district: 'Vadodara', state: 'Gujarat', city: 'Vadodara' },

  // Bihar - Patna
  { pincode: '800001', postOffice: 'Patna G.P.O.', district: 'Patna', state: 'Bihar', city: 'Patna' },
  { pincode: '800001', postOffice: 'Bankipur S.O', district: 'Patna', state: 'Bihar', city: 'Patna' },
  { pincode: '800001', postOffice: 'Fraser Road S.O', district: 'Patna', state: 'Bihar', city: 'Patna' },
  { pincode: '800020', postOffice: 'Kankarbagh S.O', district: 'Patna', state: 'Bihar', city: 'Patna' },

  // Punjab & Chandigarh
  { pincode: '160017', postOffice: 'Chandigarh Sector 17 H.O', district: 'Chandigarh', state: 'Chandigarh', city: 'Chandigarh' },
  { pincode: '160022', postOffice: 'Chandigarh Sector 22 S.O', district: 'Chandigarh', state: 'Chandigarh', city: 'Chandigarh' },
  { pincode: '141001', postOffice: 'Ludhiana H.O', district: 'Ludhiana', state: 'Punjab', city: 'Ludhiana' },
  { pincode: '143001', postOffice: 'Amritsar H.O', district: 'Amritsar', state: 'Punjab', city: 'Amritsar' },

  // Kerala & Andhra Pradesh
  { pincode: '682001', postOffice: 'Kochi H.O', district: 'Ernakulam', state: 'Kerala', city: 'Kochi' },
  { pincode: '682001', postOffice: 'Mattancherry S.O', district: 'Ernakulam', state: 'Kerala', city: 'Kochi' },
  { pincode: '695001', postOffice: 'Thiruvananthapuram G.P.O.', district: 'Thiruvananthapuram', state: 'Kerala', city: 'Thiruvananthapuram' },
  { pincode: '520001', postOffice: 'Vijayawada H.O', district: 'Krishna', state: 'Andhra Pradesh', city: 'Vijayawada' },
  { pincode: '530001', postOffice: 'Visakhapatnam H.O', district: 'Visakhapatnam', state: 'Andhra Pradesh', city: 'Visakhapatnam' },

  // North East & Other States
  { pincode: '781001', postOffice: 'Guwahati G.P.O.', district: 'Kamrup Metropolitan', state: 'Assam', city: 'Guwahati' },
  { pincode: '781001', postOffice: 'Panbazar S.O', district: 'Kamrup Metropolitan', state: 'Assam', city: 'Guwahati' },
  { pincode: '834001', postOffice: 'Ranchi G.P.O.', district: 'Ranchi', state: 'Jharkhand', city: 'Ranchi' },
  { pincode: '492001', postOffice: 'Raipur H.O', district: 'Raipur', state: 'Chhattisgarh', city: 'Raipur' },
  { pincode: '190001', postOffice: 'Srinagar G.P.O.', district: 'Srinagar', state: 'Jammu and Kashmir', city: 'Srinagar' },
  { pincode: '248001', postOffice: 'Dehradun G.P.O.', district: 'Dehradun', state: 'Uttarakhand', city: 'Dehradun' },
  { pincode: '403001', postOffice: 'Panaji H.O', district: 'North Goa', state: 'Goa', city: 'Panaji' },
  { pincode: '751001', postOffice: 'Bhubaneswar G.P.O.', district: 'Khurda', state: 'Odisha', city: 'Bhubaneswar' }
];
